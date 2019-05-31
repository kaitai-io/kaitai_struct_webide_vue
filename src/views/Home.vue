<template>
  <div class="home">
    <!-- <input type="file" @change="setHexCode"/> -->
    <div class="filetree">
      <header>files</header>
      <file-explorer @selectedFile="setHexCode" @selectedKsy="setKsy"></file-explorer>
    </div>
    <div class="editor" ref="editor"></div>
    <fudge-hex-editor ref="hexedit"></fudge-hex-editor>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';
import FileExplorer from '../components/FileExplorer.vue';
import * as KaitaiStructCompiler from 'kaitai-struct-compiler';
import * as KaitaiStream from 'kaitai-struct/KaitaiStream';
import * as yaml from 'js-yaml';

@Component({
  components: {
    FileExplorer,
  },
  mounted() {
    this.monaco = monaco.editor.create((this.$refs.editor as HTMLElement), {
      value: 'console.log("Hello, world")',
      language: 'javascript',
    });

    (this.monaco as monaco.editor.IStandaloneCodeEditor).addAction({
        id: 'recompile-ksy',
        label: 'recompile ksy file',
        keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter ],
        run: () => { this.recompile(); },
    });
  },
})
export default class Home extends Vue {
  public monaco: monaco.editor.IStandaloneCodeEditor = null;
  public compiler: any = new KaitaiStructCompiler();

  public computeTree(node, depth = 0) {
    let out;
    // console.log(node);
    out = {
      instances: {},
      sequence: [],
    };

    for (const [key, value] of Object.entries(node._debug) as [any, any]) {
      // value contains debug information / offsets
      if (value.arr) {
        // value ALSO contains arr, which we want to dig into
        const base = {
          ...value,
          name: key,
        };

        for (const [index, val] of node[key].entries()) {
          base.arr[index] = {
            ...base.arr[index],
            type: val.__proto__.constructor.name,
            value: this.computeTree(val, depth + 1),
          };
        }

        out.sequence.push(base);
      } else {
        out.sequence.push({
          ...value,
          name: key,
          value:
            (typeof node[key] === 'object' && !(node[key] instanceof Uint8Array))
              ? this.computeTree(node[key], depth + 1)
              : node[key],
        });
      }
    }
    out.sequence.sort((a, b) => a.start - b.start);

    const instanceNames = Object.keys(node)
      .filter(([k, v]) => !(Object.keys(node._debug).includes(k) && k.startsWith('_')));

    for (const name of instanceNames) {
      out.instances[name] = node[name];
    }

    // if (depth === 0) {
    //   console.log(node);
    //   console.log(out);
    // }
    return out;
  }

  public async recompile() {
    const compiled = await this.compiler.compile("javascript", yaml.safeLoad(this.monaco.getValue()), null, true);
    let name = Object.keys(compiled)[0];
    const code: string = compiled[name];

    name = name.substring(0, name.length - 3);

    let getCodeOutput: any;

    // I can't believe this actually worked
    //
    // Here's how:
    // This works by taking ONLY the parts that are necessary to create the class
    // from the generated file. This is then surrounded by references allowing it
    // to be extracted from the 'eval' VM. Finally, it is passed the KaitaiStream
    // class itself (because thats the dependency that's needed within the file),
    // along with the stream to parse, giving us the output we need.
    eval(`
      function workDamnit(KaitaiStream) {
        ${code.substring(code.indexOf(`var ${name}`), code.lastIndexOf(`return ${name}`))}
        return ${name}
      }
      getCodeOutput = workDamnit;
    `);
    const stream = new KaitaiStream(await (this.$refs.hexedit as HTMLFudgeHexEditorElement).saveFile(), 0);
    const out = new (getCodeOutput(KaitaiStream))(stream);
    out._root._read();

    this.computeTree(out);
  }

  public setKsy(file: File) {
    const fr = new FileReader();
    fr.readAsText(file, 'utf8');
    fr.onloadend = () => {
      (this.monaco).setValue(fr.result as string);
    };
  }

  public setHexCode(file: File) {
    (this.$refs.hexedit as HTMLFudgeHexEditorElement).acceptFile(file);
  }
}
</script>

<style lang="scss" scoped>
.home {
  display: grid;
  grid-template-columns: 200px 40% auto;
  height: 100%;
}
.editor {
  width: 100%;
  height: 100%;
}
.filetree {
  font-size: 15px;

  header {
    font-size: 20px;
    padding: 0 10px;
    background-color: lightgrey;
  }
}
</style>
