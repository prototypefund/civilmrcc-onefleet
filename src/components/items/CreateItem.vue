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
            >{{ template_option }}</option
          >
        </select>

        <span>Identifier</span>
        <input
          type="text"
          v-model="form_data.identifier"
          placeholder="identifier"
          @input="form_data.identifier = $event.target.value.toUpperCase()"
        />

        <div id="position" v-if="template_data.add_initial_position">
          <position
            :edit="true"
            :position="position_data.positions[0]"
          ></position>
        </div>

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
                v-for="(option_name, option) in field.options"
                :key="option"
                :value="option"
              >
                {{ option_name }}
              </option>
            </select>
          </div>
        </div>
        <input type="submit" value="Send" />
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import templates from './templates.js';
import tags from './tags.js';
import { serverBus } from '../../main';
import Position from './Position.vue';

export default {
  name: 'CreateItem',
  props: {
    properties: {
      default: '',
    },
  },
  components: {
    Position,
  },
  data: function() {
    return {
      template: '',
      vehicles: [],
      form_data: {
        properties: this.prefillTemplate(),
        template: this.givenTemplate,
      },
      position_data: {
        positions: [{}],
      },
      tags: tags,
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
    prefillTemplate() {
      let random_color =
        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
      if (this.givenTemplate == 'case') return { boat_color: random_color };
      else return { color: random_color };
    },
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
  created: function() {
    //add default value
    this.position_data.positions[0].lon = 0;
    this.position_data.positions[0].lat = 0;

    /*
    the properties object can either contain a template_name
    or a positioin which is passed from modal_data which 
    is passed to the :properties inside the App.vue.
    It would be better to pass it into a properties object like
    :properties="{template:'vehicle', position:[13,37]}"
    */
    if (typeof this.properties === 'string') {
      this.givenTemplate = this.properties;
      this.form_data.template = this.properties;
    } else if (Array.isArray(this.properties)) {
      this.position_data.positions[0].lon = this.properties[0];
      this.position_data.positions[0].lat = this.properties[1];
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
