<template>
   <div id="listview">
      <h2>Items</h2>
      <ul>
        <li>
            <h3 v-for="category in categories">{{category.plural}}</h3>
            <ul>
                <li v-if="category" v-for="item in category.items">{{item.id}}</li>
            </ul>
          
        </li>

      </ul>
   </div>
</template>

<script>

import templates from './items/templates.js'
export default {
  name: 'ListView',
  data: function () {
    return {
      categories:[]
    }
  },
  props: {
  },
  created:function(){
        var self = this;
    var all_templates = templates.get('all');
    for(var template in all_templates){
      var all_templates = all_templates;

      //i actually like js, but sometimes...
      (function(template_index) {
              self.$db.getItemsByTemplate(all_templates[template_index].pouch_identifier,function(error, result){
                if(error)
                  return alert('an error occured reading the template listview!');

                self.categories.push({
                  title:template_index,
                  plural:all_templates[template_index].plural,
                  items: result
                });

              });
      })(template);
  }
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
