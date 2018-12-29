<template>
   <div class="background" v-show="itemId != false" v-on:click.self="closeModal">
      <div class="form-style-6">
        <h1>Show Item</h1>

          <span>Identifier</span>
          <input type="text" v-model="form_data.identifier" placeholder="identifier" @input="form_data.identifier = $event.target.value.toUpperCase()">



          <div v-for="field in template_data.properties">
            <span>{{field.name}}</span>
            <input v-if="field.type != 'select'" v-model="form_data.properties[field.name]" :name="field.name" :placeholder="field.title" :type="field.type" :step="field.step" />
            <select v-if="field.type == 'select'" v-model="form_data.properties[field.name]">
              <option v-for="option in field.options">{{option}}</option>
            </select>

          </div>
          <span>Last Position</span>
          <p>
           {{last_position}}
          </p>
          
          </v-container>
          <input type="submit" value="Send" />
      </div>
   </div>
</template>
<script>

import templates from './templates.js';
import {serverBus}  from '../../main';

export default {
  name: 'ShowItem',
  props: ['itemId'],
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
          this.$db.getItem(newVal,function(doc){
            //load template for doc
            self.loadTemplate(doc.template);

            //load doc into form_data
            self.form_data = doc;

            //load last position
            doc.positions.forEach(function(v,i){

              //last position
              if(i == doc.positions.length-1){

                self.last_position = v.doc;

              }
            });
          });
        }
  },
  methods: {
    
    loadTemplate: function (template_name) {

      if(typeof template_name === 'undefined')
        template_name = 'case';
      var template = templates.get(template_name);
      console.log(template);
      this.template_data = template;
      this.$nextTick();
    },
    closeModal: function () {
     // Using the service bus
     serverBus.$emit('itemId', false);
    }
  },
  mounted:function(){
    console.log('show item mounted:');
    console.log(this.itemid);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background{
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  left:0;
  background:rgba(0,0,0,0.8);
  z-index: 9999;
}


.form-style-6{
  font: 95% Arial, Helvetica, sans-serif;
  max-width: 400px;
  margin: 10px auto;
  padding: 16px;
  background: #F7F7F7;
}
.form-style-6 h1{
  background: #43D1AF;
  padding: 20px 0;
  font-size: 140%;
  font-weight: 300;
  text-align: center;
  color: #fff;
  margin: -16px -16px 16px -16px;
}
.form-style-6 input[type="text"],
.form-style-6 input[type="date"],
.form-style-6 input[type="datetime"],
.form-style-6 input[type="email"],
.form-style-6 input[type="number"],
.form-style-6 input[type="search"],
.form-style-6 input[type="time"],
.form-style-6 input[type="url"],
.form-style-6 textarea,
.form-style-6 select 
{
  -webkit-transition: all 0.30s ease-in-out;
  -moz-transition: all 0.30s ease-in-out;
  -ms-transition: all 0.30s ease-in-out;
  -o-transition: all 0.30s ease-in-out;
  outline: none;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  width: 100%;
  background: #fff;
  margin-bottom: 4%;
  border: 1px solid #ccc;
  padding: 3%;
  color: #555;
  font: 95% Arial, Helvetica, sans-serif;
}
.form-style-6 input[type="text"]:focus,
.form-style-6 input[type="date"]:focus,
.form-style-6 input[type="datetime"]:focus,
.form-style-6 input[type="email"]:focus,
.form-style-6 input[type="number"]:focus,
.form-style-6 input[type="search"]:focus,
.form-style-6 input[type="time"]:focus,
.form-style-6 input[type="url"]:focus,
.form-style-6 textarea:focus,
.form-style-6 select:focus
{
  box-shadow: 0 0 5px #43D1AF;
  padding: 3%;
  border: 1px solid #43D1AF;
}

.form-style-6 input[type="submit"],
.form-style-6 input[type="button"]{
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  width: 100%;
  padding: 3%;
  background: #43D1AF;
  border-bottom: 2px solid #30C29E;
  border-top-style: none;
  border-right-style: none;
  border-left-style: none;  
  color: #fff;
}
.form-style-6 input[type="submit"]:hover,
.form-style-6 input[type="button"]:hover{
  background: #2EBC99;
}

</style>
