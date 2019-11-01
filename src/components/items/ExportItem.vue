<template>
    <div class="background" v-show="exportItemId != false" v-on:click.self="closeModal">
        <div class="form-style-6">
          <h1>Export Item Positions</h1>
          <form @submit="exportItem">

            <span>Identifier</span>
            <input type="text" v-model="form_data.identifier" placeholder="identifier" @input="form_data.identifier = $event.target.value.toUpperCase()">

            <span>Start Export at</span>
            <input v-model="start_time" type="datetime-local" placeholder="start time">

            <span>Stop Export at</span>
            <input type="datetime-local" v-model="stop_time" placeholder="stop time">

            <input type="submit" value="Generate CSV">

          </form>
        </div>
    </div>
</template>
<script>

import templates from './templates.js';
import {serverBus}  from '../../main';

export default {
  name: 'ShowItem',
  props: ['exportItemId'],
  data: function () {
    return {
      template: '',
      vehicles: [],
      template_data: {},
      last_position: {},
      start_time:'',
      stop_time:'',
      form_data:{properties:{}},
      position_data:{
        positions:[{}]
      }
    }
  },
  watch: { 
        exportItemId: function(newVal) { // watch it
          var self = this;
          //load doc
          this.$db.getItem(newVal,function(item){
            var doc = item.doc
            //load template for doc
            self.loadTemplate(doc.template);

            //load doc into form_data
            self.form_data = doc;
            self.position_data.positions = item.positions;

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
    exportItem:function(e){
      e.preventDefault();
        console.log(this.position_data.positions.length);
        var data = [];
        data.push(['Timestamp','Lat','Lng','Heading','Speed']);

        for(var i in this.position_data.positions){

          if(new Date(this.position_data.positions[i].doc.timestamp) > new Date(this.start_time) &&
            new Date(this.position_data.positions[i].doc.timestamp) < new Date(this.stop_time)){

            var item = [];
            if(typeof this.position_data.positions[i].doc.timestamp !== 'undefined')
              item.push(this.position_data.positions[i].doc.timestamp)
            if(typeof this.position_data.positions[i].doc.lat !== 'undefined')
              item.push(this.position_data.positions[i].doc.lat)
            if(typeof this.position_data.positions[i].doc.lon !== 'undefined')
              item.push(this.position_data.positions[i].doc.lon)
            if(typeof this.position_data.positions[i].doc.heading !== 'undefined')
              item.push(this.position_data.positions[i].doc.heading !== 'undefined')
            if(typeof this.position_data.positions[i].doc.speed !== 'undefined')
              item.push(this.position_data.positions[i].doc.speed !== 'undefined')
            data.push(item);
           }
        }
        // Building the CSV from the Data two-dimensional array
      // Each column is separated by ";" and new line "\n" for next row
      var csvContent = '';
      data.forEach(function(infoArray, index) {
        var dataString = infoArray.join(';');
        csvContent += index < data.length ? dataString + '\n' : dataString;
      });

      // The download function takes a CSV string, the filename and mimeType as parameters
      // Scroll/look down at the bottom of this snippet to see how download is called
      var download = function(content, fileName, mimeType) {
        var a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
          navigator.msSaveBlob(new Blob([content], {
            type: mimeType
          }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
          a.href = URL.createObjectURL(new Blob([content], {
            type: mimeType
          }));
          a.setAttribute('download', fileName);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
        }
      }

      download(csvContent, 'dowload.csv', 'text/csv;encoding:utf-8');
    },
    loadTemplate: function (template_name) {
      this.template_data = templates.get(template_name);
      this.$nextTick();
    },
    closeModal: function () {
     // Using the service bus
     serverBus.$emit('exportItemId', false);
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
            self.exportItemId = false;
            alert('The item has been updated');
        }

      });

    }
  },
  mounted:function(){

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
  z-index: 999;
}

.position_detail ul span{
    width: 120px;
    display: inline-block;
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
