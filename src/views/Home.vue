<template>
  <div class="home">
    <!-- <input type="file" @change="setHexCode"/> -->
    <div class="editor" ref="editor"></div>
    <!-- <fudge-hex-editor ref="hexedit"></fudge-hex-editor> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';

@Component({
  components: {

  },

  mounted() {
    monaco.editor.create((this.$refs.editor as HTMLElement), {
      language: 'javascript',
    });
  },
})
export default class Home extends Vue {

  public setHexCode(evt: Event) {
    (this.$refs.hexedit as HTMLFudgeHexEditorElement).acceptFile((evt.target as HTMLInputElement).files[0]);
  }
}
</script>

<style lang="scss" scoped>
.home {
  display: grid;
  grid-template-columns: auto;
  height: 100%;
}
.editor {
  width: 100%;
  height: 100%;
}
</style>
