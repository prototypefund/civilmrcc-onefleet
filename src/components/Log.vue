<template>
  <div class="log" v-on:click.self="closeModal">
    <ul>
      <li v-for="entry in entries" v-bind:key="entry.id">
        <header>
          <span class="timestamp">{{
            entry.id.split('_')[entry.id.split('_').length - 1]
          }}</span>
          <i class="el-icon-user"></i>
          {{ entry.doc.user }} updated "{{ entry.doc.change.index }}" on item
          <a href="#">
            {{
              entry.id.replace(
                '_' + entry.id.split('_')[entry.id.split('_').length - 1],
                ''
              )
            }}
          </a>
        </header>
        <div>
          <span class="old" v-if="entry.doc.change.old">
            {{ entry.doc.change.old }}
          </span>
          <span class="new" v-if="entry.doc.change.new">
            {{ entry.doc.change.new }}
          </span>
          <span
            class="comment"
            v-if="entry.doc.comment && entry.doc.comment.length > 0"
          >
            {{ entry.doc.comment }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { serverBus } from '../main';

export default {
  name: 'Log',
  components: {},
  data: function() {
    return {
      entries: [],
    };
  },
  methods: {
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('modal_modus', '');
    },
    clickItem: function(itemId) {
      serverBus.$emit('itemId', itemId);
    },
  },
  created: function() {
    this.$db.getLog().then(res => {
      this.entries = res.rows;
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.log {
  overflow: auto;
  position: fixed;
  top: var(--app-top);
  right: 0;
  bottom: 0;
  padding: 15px;
  width: 23vw;
  z-index: 9999;
  font-size: 10px;
}

.log .timestamp {
  font-size: 8px;
  position: absolute;
  width: 118px;
  right: 16px;
  margin-top: -14px;
  color: #545454;
}

.log ul li {
  background: #fff;
  padding: 13px;
  margin-bottom: 10px;
}

.log ul li header {
  font-size: 12px;
  margin-top: 5px;
  margin-bottom: 3px;
}
.log ul li .new,
.log ul li .old {
  display: block;
}

.log ul li .old {
  color: #ff7272;
}
.log ul li .old:before {
  color: #ff7272;
  content: '- ';
}

.log ul li .new:before {
  color: #52f500;
  content: '+ ';
}

.log a:link {
  text-decoration: none;
}
</style>
