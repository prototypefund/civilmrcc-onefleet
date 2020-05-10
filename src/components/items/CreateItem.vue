<template>
  <div class="background" v-on:click.self="closeModal">
    <div class="form-style-6">
      <h1>Add new {{ form_data.template }}</h1>
      <form @submit="createItem">
        <span>Template</span>
        <select v-model="form_data.template" class="select-css" required>
          <option
            v-for="template_option in template_options"
            :label="template_option"
            :name="template_option"
            :key="template_option"
          >
            {{ template_option }}
          </option>
        </select>

        <span>Identifier</span>
        <input
          type="text"
          v-model="form_data.identifier"
          placeholder="identifier"
          @input="form_data.identifier = $event.target.value.toUpperCase()"
        />

        <div id="position" v-if="template_data.add_initial_position">
          <span>Latitude</span>
          <input
            type="number"
            step="any"
            name="lat"
            placeholder="Latitude"
            v-model="position_data.positions[0].lat"
          />

          <span>Longitude</span>
          <input
            type="number"
            step="any"
            name="lon"
            placeholder="Longitude"
            v-model="position_data.positions[0].lon"
          />
        </div>

        <div v-for="field in template_data.fields" :key="field.name">
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

          <input
            v-if="field.type != 'select' && field.type != 'icon'"
            v-model="form_data.properties[field.name]"
            :name="field.name"
            :placeholder="field.title"
            :type="field.type"
            :step="field.step"
          />
          <select
            v-if="field.type == 'select'"
            class="select-css"
            v-model="form_data.properties[field.name]"
          >
            <option
              v-for="option in field.options"
              :key="option"
              :value="field.options[option]"
              >{{ option }}</option
            >
          </select>
        </div>
        <input type="submit" value="Send" />
      </form>
    </div>
  </div>
</template>
<script>
import templates from './templates.js';
import { serverBus } from '../../main';
export default {
  name: 'CreateItem',
  props: {
    givenTemplate: {
      type: String,
      default: '',
    },
  },
  data: function() {
    return {
      twmplate: '',
      vehicles: [],
      form_data: { properties: {}, template: this.givenTemplate },
      position_data: {
        positions: [{}],
      },
    };
  },
  computed: {
    template_data: function() {
      // change (cached) template data whenever the selected template string in form_data changes
      return templates.get(this.form_data.template) || {};
    },
    template_options: function() {
      return Object.keys(templates.get('all'));
    },
  },

  methods: {
    createItem: function(e) {
      var self = this;

      this.form_data._id = String(
        this.form_data.template + '_' + this.form_data.identifier
      ).toUpperCase();
      if (
        this.template_data.add_initial_position == false ||
        (this.position_data.positions[0].lat &&
          this.position_data.positions[0].lon)
      ) {
        this.$db.createItem(this.form_data, function(err, result) {
          if (err) {
            if (err.name == 'conflict')
              alert('The id is already taken, please choose another one');
            else alert('An unknown error occured while creating the item');

            console.error(err);
          } else if (result.ok == true) {
            alert('item created');

            if (
              self.position_data.positions[0].lat &&
              self.position_data.positions[0].lon
            ) {
              let position = {
                _id: self.form_data.identifier + '_' + new Date().toISOString(),
                lat: self.position_data.positions[0].lat,
                lon: self.position_data.positions[0].lon,
                item_identifier: self.form_data.identifier,
                source: 'onefleet',
                timestamp: new Date().toISOString(),
              };
              self.$db.createPosition(position, function(err, result) {
                if (err) {
                  alert('error!');
                } else {
                  if (result.ok) alert('position created');
                  self.closeModal();
                }
              });
            }
          }
        });
      } else {
        alert('please enter a valid position');
      }

      e.preventDefault();
    },
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('modal_modus', '');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
