<template>
  <div id="mapArea">
    Map
  </div>
</template>

<script>
import { serverBus } from '../main';
export default {
  name: 'MapArea',
  data: function() {
    return {
      map_initialized: false,
    };
  },
  mounted: function() {
    var self = this;

    serverBus.$on('shown_items', shown_items => {
      self.shown_items = shown_items;
      self.$db.updateShownItemsOnMap(this.$map, {
        shown_items: shown_items,
        map: self.$map,
      });

    });

    serverBus.$on('fly_to_position', position => {
      self.$map.flyTo(position);
    });

    serverBus.$on('start_replay', replayData => {
      console.log(replayData);
      replayData.map = self.$map;
      replayData.shown_items = self.shown_items;
      serverBus.$emit('replay_started',1);
      self.$db.startReplay(replayData,function(){
        serverBus.$emit('replay_finished',1);
      });
    });

    this.$map.init('mapArea');
    this.$map.clickItem = function(itemId) {
      serverBus.$emit('itemId', itemId);
    };
    this.$db.updateShownItemsOnMap(this.$map, {
      shown_items: self.shown_items,
      map: this.$map,
    });
    this.$db.setOnChange('positions', 'map_area', function(change) {
      return null;
      if (change.direction == 'push') {
        change.change.docs.forEach(function(item) {
          let identifier = 'VEHICLE_' + item.item_identifier;
          if (self.shown_items[identifier] == 'true') {
            self.$db.getItem(identifier, function(item) {
              self.$map.updateItemPosition(self.$map.loadTemplatedItem(item));
            });
          }
        });
      }
    });
  },
  created: function() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#mapArea {
  height: calc(100vh - 60px);
}

.vehicle-marker {
  height: 16px !important;
  width: 16px !important;
  margin-left: 0 !important;
  margin-top: 0 !important;
}

.itemCaption{
  background: rgba(0,0,0,0.8);
  color: #FFF;
  padding: 3px;
  width: 80px;
  display: block;
  margin-left: -43px;
  text-align: center;
  font-size: 10px;
}
</style>
