<template>
  <div class="background" v-show="itemId != false" v-on:click.self="closeModal">
    <div class="form-style-6" v-if="template_data && template_data.fields">
      <h1>Show {{ historical_form_data.template }}</h1>
      <form @submit="storeItem">
        <Position v-bind:position="last_position"></Position>
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
        <a v-on:click="showExportModal(itemId)">Export Locations</a>
        <input type="submit" value="Save" />
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
  props: ['itemId'],
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
      positions: [{}],
    },
    tags: tags,
  }),
  watch: {
    itemId: function(newVal) {
      // watch it
      const self = this;
      //load doc
      if (newVal) {
        // newVal may change types from string to boolean. fixme.
        this.$db.getItem(newVal, function(item) {
          const doc = item.doc;
          //load template for doc
          self.loadTemplate(doc.template);

          //load doc into form_data and historical formdata for changelog
          self.form_data = doc;
          self.historical_form_data = JSON.parse(JSON.stringify(doc));

          //load last position
          item.positions.forEach(function(v, i) {
            //last position
            if (i == item.positions.length - 1) {
              self.last_position = v.doc;
            }
          });
        });
      } else {
        // dialog was closed, so reset the fields:
        this.form_data = { properties: {} };
        this.template_data = {};
        this.last_position = {};
        this.historical_form_data = {};
        this.position_data = { positions: [{}] };
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
      serverBus.$emit('itemId', false);
    },
    showExportModal: function(id) {
      serverBus.$emit('itemId', false);
      // Using the service bus
      serverBus.$emit('exportItemId', id);
    },
    storeItem: function(e) {
      e.preventDefault();
      const changes: {
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
            old: this.historical_form_data.properties[i],
            new: this.form_data.properties[i],
          });
        }
      }
      /*for (let i in changes) {
        //this.$db.addItemLog(this.itemId, changes[i]);
      }*/

      var self = this;
      this.$db.createItem(this.form_data, function(err, result) {
        if (err) {
          if (err.name == 'conflict')
            alert('The id is already taken, please choose another one');
          else alert('An unknown error occured while creating the item');

          console.error(err);
        } else {
          if (result.ok == true) self.closeModal();
          alert('The item has been updated');
        }
      });
    },
  },
  mounted: () => {},
};
</script>
