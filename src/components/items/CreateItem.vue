<template>
   <div class="background" v-on:click.self="closeModal">
      <div class="form-style-6">
        <h1>Create Item</h1>
        <form @submit="createItem">
          <span>Template</span>
          <select v-model="form_data.template" @change="loadTemplate()" class="select-css" required>
            <option>case</option>
            <option>vehicle</option>
            <option>sighting</option>
          </select>


          <span>Identifier</span>
          <input type="text" v-model="form_data.identifier" placeholder="identifier" @input="form_data.identifier = $event.target.value.toUpperCase()" >


          <div id="position" v-if="template_data.add_initial_position">
            <span>Latitude</span>
            <input type="number" step="any" name="lat" placeholder="Latitude" v-model="position_data.positions[0].lat">

            <span>Longitude</span>
            <input type="number" step="any" name="lon" placeholder="Longitude" v-model="position_data.positions[0].lon">
          </div>

          <div v-for="field in template_data.fields">
            <span>{{field.title}}</span>
            <input v-if="field.type != 'select'" v-model="form_data.properties[field.name]" :name="field.name" :placeholder="field.title" :type="field.type" :step="field.step" />
            <select v-if="field.type == 'select'" class="select-css" v-model="form_data.properties[field.name]">
              <option v-for="option in field.options" :value="field.options[option]">{{option}}</option>
            </select>

          </div>
          <input type="submit" value="Send" />
        </form>
      </div>
   </div>
</template>
<script>

import templates from './templates.js'
import {serverBus}  from '../../main';
export default {
  name: 'CreateItem',
  data: function () {
    return {
      twmplate: '',
      vehicles: [],
      template_data: '',
      form_data:{properties:{}},
      position_data:{
        positions:[{}]
      }
    }
  },
  methods: {
    createItem:function(e){

      var self = this;

      this.form_data._id = String(this.form_data.template+'_'+this.form_data.identifier).toUpperCase();
      this.$db.createItem(this.form_data,function(err,result){

        if(err){
          if(err.name == 'conflict')
            alert('The id is already taken, please choose another one');
          else
            alert('An unknown error occured while creating the item');

            console.log(err.name);
        }else{
          if(result.ok == true)
            alert('case created');

            var position = {
              "_id": self.form_data.identifier+"_"+new Date().toISOString(),
              "lat": self.position_data.positions[0].lat,
              "lon": self.position_data.positions[0].lon,
              "item_identifier":self.form_data.identifier,
               "source":"onefleet",
               "timestamp":new Date().toISOString()
            }
            self.$db.createPosition(position,function(err,result){
              if(err){
                alert('error!')
              }else{
                if(result.ok)
                  alert('position created')
              }
            })
        }

      });
      e.preventDefault();
    },
    loadTemplate: function (event) {
      console.log(this.form_data.template);
      var template = templates.get(this.form_data.template);
      this.template_data = template;
      this.$nextTick();
    },
    closeModal: function () {
     // Using the service bus
     serverBus.$emit('modal_modus', '');
    }
  },
  mounted: function() {
    var self = this;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
