<template>
  <div class="background" v-show="itemId != false" v-on:click.self="closeModal">
    <div class="form-style-6" v-if="template_data && template_data.fields">
      <h1>Showing {{ itemTitleText }}</h1>
      <form @submit="storeItem">
        <Position v-if="last_position" :position="last_position"></Position>
        <span style="padding-top:20px">Identifier</span>
        <input
          type="text"
          v-model="form_data.identifier"
          placeholder="identifier"
          @input="form_data.identifier = $event.target.value.toUpperCase()"
          readonly
        />
        <div v-for="field in template_data.fields" :key="field.name">
          <div v-if="!field.hidden">
            <span>{{ field.title }}</span>

            <!-- iconwrapper start -->
            <div class="iconwrapper" v-if="field.type == 'icon'">
              <input
                v-model="form_data.properties[field.name]"
                :name="field.name"
                :placeholder="field.title"
                type="text"
                class="icon"
              />
              <span
                class="preview-icon"
                :class="'el-icon-' + form_data.properties[field.name]"
                >&nbsp;</span
              >
            </div>
            <!-- iconwrapper end -->

            <!-- tags start -->
            <tags-input
              v-if="field.type == 'tag'"
              element-id="tags"
              v-model="form_data.properties[field.name]"
              :existing-tags="
                tags.getTagsForField(form_data.template, field.name)
              "
              :typeahead="true"
              typeahead-style="dropdown"
            ></tags-input>
            <!-- tags end -->

            <input
              v-if="
                field.type != 'select' &&
                  field.type != 'icon' &&
                  field.type != 'tag'
              "
              v-model="form_data.properties[field.name]"
              :name="field.name"
              :placeholder="field.title"
              :type="field.type"
              :step="field.step"
            />
            <select
              v-if="field.type == 'select'"
              v-model="form_data.properties[field.name]"
              class="select-css"
            >
              <option
                v-for="(option_name, option) in field.options"
                :key="option"
                :value="option"
                >{{ option_name }}</option
              >
            </select>
          </div>
        </div>
        <a @click="showExportModal(itemId)">Export Locations</a>
        <div class="save_cancel_buttons">
          <input type="submit" :value="'Save' + savePositionText" />
          <input type="button" value="Cancel" @click="closeModal()" />
          <br />
          <input
            type="checkbox"
            id="commentCheck"
            value="true"
            style="width:auto!important;"
            v-model="showCommentBox"
          />
          <label for="commentCheck"><small>comment change</small></label>
        </div>
        <div v-if="showCommentBox">
          <textarea
            placeholder="comment"
            v-model="comment"
            id="comment"
          ></textarea>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import templates from './templates.js';
import Position from './Position.vue';
import tags from './tags.js';
import { serverBus } from '../../main';

export default {
  name: 'ShowItem',

  props: {
    itemId: { type: String, default: '' },
    given_positions: { type: Array, default: () => [] },
    mapped_base_items: { type: Object, required: true },
    positions_per_item: { type: Object, required: false },
  },

  components: {
    Position,
  },

  data: () => ({
    template: '',
    vehicles: [],
    template_data: {},
    last_position: {},
    form_data: { properties: {} },
    historical_form_data: {}, //will be used for change log comparison
    position_data: {
      positions: [],
    },
    historical_position_data: {
      positions: [],
    },
    showCommentBox: false,
    comment: '',
    tags: tags,
  }),

  computed: {
    itemTitleText() {
      return (
        this.historical_form_data.template +
        ' ' +
        (this.form_data.properties.name || this.form_data.identifier)
      );
    },
    savePositionText() {
      let len = this.given_positions.length;
      if (len > 1) return ' (+' + len + ' new Positions)';
      else if (len == 1) return ' (+1 new Position)';
      else return '';
    },
  },

  watch: {
    itemId: function(newVal) {
      // watch it
      let doc = this.mapped_base_items[newVal];

      //load doc
      if (doc) {
        // load template for doc
        this.loadTemplate(doc.template);

        // load doc into form_data and historical formdata for changelog
        this.historical_form_data = doc;
        this.form_data = JSON.parse(JSON.stringify(doc));

        // concatenate given positions with existing positions_per_item
        // sort positions by timestamp string. Move positions without timestamp field to end of list.
        let existing_positions = this.positions_per_item[doc.identifier] || [];
        let mixed_positions = this.given_positions.concat(existing_positions);
        let sorted_positions = mixed_positions.sort((a, b) =>
          (a.timestamp || '').localeCompare(b.timestamp || '')
        );

        // get last position
        this.last_position = sorted_positions[sorted_positions.length - 1];
      } else {
        // dialog was closed, so reset the fields:
        this.form_data = { properties: {} };
        this.template_data = {};
        this.last_position = {};
        this.historical_form_data = {};
        this.position_data = { positions: [] };
        this.historial_position_data = { positions: [] };
      }
    },
  },

  methods: {
    loadTemplate: function(template_name) {
      this.template_data = templates.get(template_name);
      this.$nextTick();
    },
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('close_modal');
    },
    showExportModal: function(id) {
      // close this modal and open exports
      serverBus.$emit('close_modal');
      serverBus.$emit('exportItemId', id);
    },
    storeItem: function(e) {
      e.preventDefault();

      const changes: {
        index: string;
        old: string;
        new: string;
      }[] = [];
      //compare the changed form data with historic properties to identify changes
      for (let i in this.form_data.properties) {
        if (
          this.historical_form_data.properties[i] !=
          this.form_data.properties[i]
        ) {
          changes.push({
            index: i,
            old: this.historical_form_data.properties[i],
            new: this.form_data.properties[i],
          });
        }
      }

      for (let i in changes) {
        this.$db.addItemLog(this.itemId, changes[i], this.comment);
      }
      this.comment = '';
      this.$db.createItem(this.form_data, (err, result) => {
        if (err) {
          if (err.name == 'conflict')
            alert('The id is already taken, please choose another one');
          else alert('An unknown error occured while creating the item');
          console.error('error while storing item:', err);
        } else {
          if (result.ok == true) {
            this.closeModal();
            this.$message({
              title: 'Success',
              type: 'success',
              duration: 5000,
              message: 'The ' + this.itemTitleText + ' has been updated',
            });

            if (this.given_positions.length > 0) {
              let item_identifier = this.form_data.identifier;
              let errors: Array<Object> = [];

              // store all given positions at once. Use iteration `i` as part of new `_id` field
              this.given_positions.forEach((given_pos, i) => {
                let time_isostring = (given_pos.timestamp
                  ? new Date(given_pos.timestamp)
                  : new Date()
                ).toISOString();

                let db_position = {
                  _id: item_identifier + '_' + time_isostring + '_' + i,
                  lat: given_pos.lat,
                  lon: given_pos.lon,
                  item_identifier: item_identifier,
                  source: given_pos.source || 'onefleet',
                  timestamp: time_isostring,
                };
                this.$db.createPosition(db_position, (err, result) => {
                  if (err) {
                    console.error('could not store pos:', err, db_position);
                    errors.push(db_position);
                  } else {
                    if (result.ok)
                      console.log('position created:', db_position);
                  }
                });
              });

              // TODO use async-await here !!
              let expected = this.given_positions.length;
              let title = this.itemTitleText;
              setTimeout(
                () => this.reportPositionStorageErrors(errors, expected, title),
                1000 // :(
              );
            }
          }
        }
      });
    },

    reportPositionStorageErrors(errors, expected, title): boolean {
      // report any errors, or success
      if (errors.length > 0) {
        let count_string = errors.length + ' of ' + expected;
        this.$message({
          showClose: true,
          type: 'error',
          duration: 0,
          message: 'Error! Could not store ' + count_string + ' position(s).',
        });
        return false;
      } else {
        this.$message({
          title: 'Success',
          type: 'success',
          duration: 5000,
          message:
            expected >= 2
              ? 'All ' + expected + ' new positions have been stored'
              : 'The new position for ' + title + ' has been stored',
        });
        return true;
      }
    },
  },

  mounted() {},

  created() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
form a {
  cursor: pointer;
}
form a:hover {
  text-decoration: underline;
}
small {
  font-size: 10px;
}

#comment {
  width: 80px;
}
</style>
