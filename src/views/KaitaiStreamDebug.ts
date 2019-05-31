// this is a custom ESM implementation of KaitaiStream that
// preserves the information about chunks while parsing
// tslint:disable: variable-name

export default class KaitaiStream {

  /**
   * Dependency configuration data. Holds urls for (optional) dynamic loading
   * of code dependencies from a remote server. For use by (static) processing functions.
   *
   * Caller should the supported keys to the asset urls as needed.
   * NOTE: `depUrls` is a static property of KaitaiStream (the factory),like the various
   *       processing functions. It is NOT part of the prototype of instances.
   *
   * @static
   * @type {Object}
   * @memberof KaitaiStream
   */
  public static depUrls: {zlib?: string, [key: string]: any} = {
    // processZlib uses this and expected a link to a copy of pako.
    // specifically the pako_inflate.min.js script at:
    // https://raw.githubusercontent.com/nodeca/pako/master/dist/pako_inflate.min.js
    zlib: undefined,
  };

  /**
   * Virtual byte length of the KaitaiStream backing buffer.
   * Updated to be max of original buffer size and last written size.
   * If dynamicSize is false is set to buffer size.
   *
   * @type {number}
   * @memberof KaitaiStream
   */
  private _byteLength: number = 0;


  private _buffer!: ArrayBuffer;
  private _byteOffset!: number;
  private _dataView!: DataView;

  constructor(arrayBuffer: ArrayBuffer | any, byteOffset: number = 0) {
    this._byteOffset = byteOffset;
    if (arrayBuffer instanceof ArrayBuffer) {
      this.buffer = arrayBuffer;
    } else if (typeof arrayBuffer === "object") {
      this.dataView = arrayBuffer;
      this._byteOffset += byteOffset;
    } else {
      this.buffer = new ArrayBuffer(arrayBuffer || 1);
    }
    this.pos = 0;
    this.alignToByte();
  }

  /**
   * Set/get the backing ArrayBuffer of the KaitaiStream object.
   * The setter updates the DataView to point to the new buffer.
   */
  get buffer() {
    this._trimAlloc();
    return this._buffer;
  }
  set buffer(v: any) {
    this._buffer = v;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  /**
   * Set/get the byteOffset of the KaitaiStream object.
   * The setter updates the DataView to point to the new byteOffset.
   * @type {number}
   */
  get byteOffset() {
    return this._byteOffset;
  }
  set byteOffset(v: any) {
    this._byteOffset = v;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  /**
   * Set/get the backing DataView of the KaitaiStream object.
   * The setter updates the buffer and byteOffset to point to the DataView values.
   * @type {Object}
   */
  get dataView() {
    return this._dataView;
  }
  set dataView(v: DataView) {
    this._byteOffset = v.byteOffset;
    this._buffer = v.buffer;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._byteOffset + v.byteLength;
  }

  /**
   * Internal function to trim the KaitaiStream buffer when required.
   * Used for stripping out the extra bytes from the backing buffer when
   * the virtual byteLength is smaller than the buffer byteLength (happens after
   * growing the buffer with writes and not filling the extra space completely).
   */
  private _trimAlloc(): null | undefined {
    if (this._byteLength === this._buffer.byteLength) {
      return;
    }
    const buf = new ArrayBuffer(this._byteLength);
    const dst = new Uint8Array(buf);
    const src = new Uint8Array(this._buffer, 0, dst.length);
    dst.set(src);
    this.buffer = buf;
  }

// ========================================================================
// Stream positioning
// ========================================================================


}