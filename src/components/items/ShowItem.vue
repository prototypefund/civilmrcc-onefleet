<template>
    <div class="background" v-show="itemId != false" v-on:click.self="closeModal">
        <div class="form-style-6"  v-if="template_data&&template_data.fields">
          <h1>Show Item</h1>
          <form @submit="storeItem">

            <Position v-bind:position="last_position"></Position>
            <span style="padding-top:20px">Identifier</span>
            <input type="text" v-model="form_data.identifier" placeholder="identifier" @input="form_data.identifier = $event.target.value.toUpperCase()">
            <div v-for="field in template_data.fields">
              <span>{{field.title}}</span>
              <input v-if="field.type != 'select'" v-model="form_data.properties[field.name]" :name="field.name" :placeholder="field.title" :type="field.type" :step="field.step" />
              <select v-if="field.type == 'select'" v-model="form_data.properties[field.name]" class="select-css">
                <option v-for="option in field.options":value="field.options[option]">{{option}}</option>
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
      historical_form_data:{}, //will be used for change log comparison 
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

            //load doc into form_data and historical formdata for changelog
            self.form_data = doc;
            self.historical_form_data = JSON.parse(JSON.stringify(doc));

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


      let changes = [];
      //compare the changed form data with historic properties to identify changes
      for(let i in this.form_data.properties){
        if(this.historical_form_data.properties[i] != this.form_data.properties[i]){
          changes.push({old:this.historical_form_data.properties[i],new:this.form_data.properties[i]});
        }
      }
      console.log(changes)

      for(let i in changes){
        this.$db.addItemLog(itemId, changes[i]);
      }

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

