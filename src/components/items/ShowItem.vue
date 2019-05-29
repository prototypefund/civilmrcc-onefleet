<template>
    <div class="background" v-show="itemId != false" v-on:click.self="closeModal">
        <div class="form-style-6"  v-if="template_data&&template_data.fields">
          <h1>Show Item</h1>
          <form @submit="storeItem">

            <Position v-bind:position="last_position"></Position>
            <span style="padding-top:20px">Identifier</span>
            <input type="text" v-model="form_data.identifier" placeholder="identifier" @input="form_data.identifier = $event.target.value.toUpperCase()">
            <div v-for="field in template_data.fields">
              <span>{{field.name}}</span>
              <input v-if="field.type != 'select'" v-model="form_data.properties[field.name]" :name="field.name" :placeholder="field.title" :type="field.type" :step="field.step" />
              <select v-if="field.type == 'select'" v-model="form_data.properties[field.name]">
                <option v-for="option in field.options">{{option}}</option>
              </select>

            </div>
            <a v-on:click="showExportModal(itemId)">Export Locations</a>
            <input type="submit" value="Save" />

          </form>
        </div>
    </div>
</template>
<script>

import templates from './templates.js';
import Position from './Position';
import {serverBus}  from '../../main';

export default {
  name: 'ShowItem',
  props: ['itemId'],
  components:{
    Position
  },
  data: function () {
    return {
      template: '',
      vehicles: [],
      template_data: {},
      last_position: {},
      form_data:{properties:{}},
      position_data:{
        positions:[{}]
      }
    }
  },
  watch: { 
        itemId: function(newVal, oldVal) { // watch it
          var self = this;
          //load doc
          this.$db.getItem(newVal,function(item){
            var doc = item.doc
            //load template for doc
            self.loadTemplate(doc.template);

            //load doc into form_data
            self.form_data = doc;

            //load last position
            item.positions.forEach(function(v,i){

              //last position
              if(i == item.positions.length-1){

                self.last_position = v.doc;

              }
            });
          });
        }
  },
  methods: {
    
    loadTemplate: function (template_name) {
      this.template_data = templates.get(template_name);
      this.$nextTick();
    },
    closeModal: function () {
     // Using the service bus
     serverBus.$emit('itemId', false);
    },
    showExportModal: function(id){
     
     serverBus.$emit('itemId', false);
     // Using the service bus
     serverBus.$emit('exportItemId', id);
    },
    storeItem: function(e){
      e.preventDefault();
      var self = this;
      this.$db.createItem(this.form_data,function(err,result){

        if(err){
          if(err.name == 'conflict')
            alert('The id is already taken, please choose another one');
          else
            alert('An unknown error occured while creating the item');

            console.log(err.name);
            console.log(err);
        }else{
          if(result.ok == true)
            self.itemId = false;
            alert('The item has been updated');
        }

      });

    }
  },
  mounted:function(){

  }
}
</script>

