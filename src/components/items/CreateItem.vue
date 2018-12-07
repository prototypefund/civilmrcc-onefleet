<template>
   <div class="background">
      <div class="form-style-6">
        <h1>Create Item</h1>
        <form @submit="createItem">
          <span>Template</span>
          <select v-model="form_data.template" @change="loadTemplate()">
            <option>case</option>
            <option>vehicle</option>
          </select>


          <span>Identifier</span>
          <input type="text" v-model="form_data.identifier" placeholder="identifier" @input="form_data.identifier = $event.target.value.toUpperCase()">


          <div id="position">
            <span>Latitude</span>
            <input type="number" step="any" name="lat" placeholder="Latitude" v-model="position_data.positions[0].lat">

            <span>Longitude</span>
            <input type="number" step="any" name="lon" placeholder="Longitude" v-model="position_data.positions[0].lon">
          </div>

          <div v-for="field in template_data.fields">
            <span>{{field.name}}</span>
            <input v-if="field.type != 'select'" v-model="form_data.properties[field.name]" :name="field.name" :placeholder="field.title" :type="field.type" :step="field.step" />
            <select v-if="field.type == 'select'" v-model="form_data.properties[field.name]">
              <option v-for="option in field.options">{{option}}</option>
            </select>

          </div>
          <textarea name="field3" placeholder="Type your Message">
            {{form_data}}
          </textarea>
          <input type="submit" value="Send" />
        </form>
      </div>
   </div>
</template>
<script>

import templates from './templates.js'
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
            alert('everything is ok!');

            var position = {
              "_id": self.form_data.identifier+"_"+new Date().toISOString(),
              "lat": self.position_data.positions[0].lat,
              "lon": self.position_data.positions[0].lon,
              "item_identifier":self.form_data.identifier,
               "source":"sar_app",
               "timestamp":new Date().toISOString()
            }
            self.$db.createPosition(position,function(err,result){
              if(err){
                alert('error!')
              }else{
                if(result.ok)
                  alert('everything is ok')
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
    }
  },
  mounted: function() {
    var self = this;
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
