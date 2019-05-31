<template>
  <div>
    <input type="file" @change="addFile"/>
    <sl-vue-tree v-model="nodes" @dblclick.native="handleDblClick"></sl-vue-tree>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import slVueTree from 'sl-vue-tree';
import localforage from 'localforage';

@Component({
  components: {
    slVueTree,
  },
  async mounted() {
    this.files = await localforage.getItem('files') || {};
    this.nodes = Object.keys(this.files as {[key: string]: File}).map((name) => {
      return {title: name, isLeaf: true};
    });
  },
})
export default class FileExplorer extends Vue {
  public files: {[key: string]: File} = {};
  public nodes = [];

  public async addFile(evt: Event) {
    const file = (evt.target as HTMLInputElement).files[0];

    this.files[file.name] = file;
    this.nodes.push({title: file.name, isLeaf: true});

    await localforage.setItem('files', this.files);
  }

  public handleDblClick(evt: Event) {
    let file = this.files[(evt.target as HTMLElement).innerText];
    if (file.name.endsWith('.ksy')) {
      this.$emit('selectedKsy', file);
    }
    else {
      this.$emit('selectedFile', file);
    }
  }
}

</script>

<style lang="scss">
.sl-vue-tree {
    position: relative;
    cursor: default;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
}

.sl-vue-tree-root > .sl-vue-tree-nodes-list {
    overflow: hidden;
    position: relative;
    padding-bottom: 4px;
}

.sl-vue-tree-selected > .sl-vue-tree-node-item {
    background-color: rgba(100, 100, 255, 0.5);
}

.sl-vue-tree-node-list {
    position: relative;
    display: flex;
    flex-direction: row;
}

.sl-vue-tree-node-item {
    position: relative;
    display: flex;
    flex-direction: row;
}
.sl-vue-tree-node-item.sl-vue-tree-cursor-inside {
    outline: 1px solid rgba(100, 100, 255, 0.5);
}

.sl-vue-tree-gap {
    width: 20px;
    min-height: 1px;

}

.sl-vue-tree-sidebar {
    margin-left: auto;
}

.sl-vue-tree-cursor {
    position: absolute;
    border: 1px solid rgba(100, 100, 255, 0.5);
    height: 1px;
    width: 100%;
}

.sl-vue-tree-drag-info {
    position: absolute;
    background-color: rgba(0,0,0,0.5);
    opacity: 0.5;
    margin-left: 20px;
    margin-bottom: 20px;
    padding: 5px 10px;
}
</style>
