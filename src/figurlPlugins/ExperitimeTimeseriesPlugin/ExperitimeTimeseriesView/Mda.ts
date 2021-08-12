class Mda {
	_N1: number = 1
	_N2: number = 1
	_N3: number = 1
	_N4: number = 1
	_N5: number = 1
	_totalSize: number = 1
	_data: Float32Array | Float64Array | Int16Array = new Float32Array(1)
	constructor(n1?: number, n2?: number, n3?: number, n4?: number, n5?: number) {
		this.allocate(n1 || 1, n2 || 1, n3, n4, n5)
	}
	allocate(n1: number, n2: number, n3?: number, n4?: number, n5?: number): void {
		this._N1 = n1 || 1
		this._N2 = n2 || 1
		this._N3 = n3 || 1
		this._N4 = n4 || 1
		this._N5 = n5 || 1
		this._totalSize = this._N1 * this._N2 * this._N3 * this._N4 * this._N5
		this._data = new Float32Array(this._totalSize)
		this._data.fill(0)
	}
	N1(): number {return this._N1}
	N2(): number {return this._N2}
	N3(): number {return this._N3}
	N4(): number {return this._N4}
	N5(): number {return this._N5}
	totalSize(): number {return this._totalSize}
	value(i1: number, i2?: number, i3?: number, i4?: number, i5?: number): number {
		if (i2 === undefined) {
			return this._data[i1]
		}
		else if (i3 === undefined) {
			return this._data[i1 + this._N1 * i2]
		}
		else if (i4 === undefined) {
			return this._data[i1 + this._N1 * i2 + this._N1 * this._N2 * i3]
		}
		else if (i5 === undefined) {
			return this._data[i1 + this._N1 * i2 + this._N1 * this._N2 * i3 + this._N1 * this._N2 * this._N3 * i4]
		}
		else {
			return this._data[i1 + this._N1 * i2 + this._N1 * this._N2 * i3 + this._N1 * this._N2 * this._N3 * i4 + this._N1 * this._N2 * this._N3 * this._N4 * i5]
		}
	}
	setValue(val: number, i1: number, i2: number, i3?: number, i4?: number, i5?: number): void {
		if (i2 === undefined) {
			this._data[i1] = val
		}
		else if (i3 === undefined) {
			this._data[i1 + this._N1 * i2] = val
		}
		else if (i4 === undefined) {
			this._data[i1 + this._N1 * i2 + this._N1 * this._N2 * i3] = val
		}
		else if (i5 === undefined) {
			this._data[i1 + this._N1 * i2 + this._N1 * this._N2 * i3 + this._N1 * this._N2 * this._N3 * i4] = val
		}
		else {
			this._data[i1 + this._N1 * i2 + this._N1 * this._N2 * i3 + this._N1 * this._N2 * this._N3 * i4 + this._N1 * this._N2 * this._N3 * this._N4 * i5] = val
		}
	}
	data(): Float32Array | Float64Array | Int16Array {
		return this._data
	}
	dataCopy(): Float32Array | Float64Array | Int16Array {
		return this._data.slice()
	}
	setData(d: Float32Array | Float64Array | Int16Array): void {
		this._data = d
	}
	clone(): Mda {
		var ret = new Mda(this._N1, this._N2, this._N3, this._N4, this._N5)
		ret.setData(this.dataCopy())
		return ret
	}
	reshape(n1: number, n2: number, n3?: number, n4?: number, n5?: number): void {
		n2 = n2 || 1; n3 = n3 || 1; n4 = n4 || 1; n5 = n5 || 1
		var tot = n1 * n2 * n3 * n4 * n5
		if (tot !== this._totalSize) {
			throw Error('Unable to reshape... incompatible size: ' + n1 + 'x' + n2 + 'x' + n3 + 'x' + n4 + 'x' + n5 + '    ' + this.N1() + 'x' + this.N2() + 'x' + this.N3() + 'x' + this.N4() + 'x' + this.N5())
		}
		this._N1 = n1
		this._N2 = n2
		this._N3 = n3
		this._N4 = n4
		this._N5 = n5
	}
	getChunk(i: number, size: number): Mda {
		var ret = new Mda(size, 1)
		ret.setData(this._data.subarray(i, i + size))
		return ret
	}
	subArray(arg1: number, arg2: number, arg3?: number, arg4?: number, arg5?: number, arg6?: number): Mda {
		let iii, sss, ret
		if (arg3 === undefined) {
			return this.getChunk(arg1, arg2)
		}
		else if (arg5 === undefined) {
			if (arg4 === undefined) throw Error('Unexpected')
			if ((arg3 !== this.N1()) || (arg1 !== 0)) {
				throw Error('This case not supported yet: subArray.');
			}
			iii = arg2 * this.N1()
			sss = arg4 * this.N1()
			ret = this.getChunk(iii, sss)
			ret.reshape(arg3, arg4)
			return ret
		}
		else {
			if (arg6 === undefined) throw Error('Unexpected')
			if ((arg4 !== this.N1()) || (arg1 !== 0)) {
				throw Error('This case not supported yet: subArray.');
			}
			if ((arg5 !== this.N2()) || (arg2 !== 0)) {
				throw Error('This case not supported yet: subArray.');
			}
			iii = arg3 * this.N1() * this.N2()
			sss = arg6 * this.N1() * this.N2()
			ret = this.getChunk(iii, sss)
			ret.reshape(arg4, arg5, arg6)
			return ret
		}
	}
	setFromArrayBuffer(buf: ArrayBuffer): void {
		var X = new Int32Array(buf.slice(0, 64))
		// var num_bytes_per_entry = X[1];
		var num_dims = X[2]
		let dims: number[] = []
		if ((num_dims < 1) || (num_dims > 5)) {
			throw Error('Invalid number of dimensions: ' + num_dims);
		}
		for (var i = 0; i < num_dims; i++) {
			dims.push(X[3 + i])
		}
		var dtype = get_dtype_string(X[0])
		var header_size = (num_dims + 3) * 4;
		if (dtype === 'float32') {
			const data = new Float32Array(buf.slice(header_size))
			this.allocate(dims[0], dims[1], dims[2], dims[3], dims[4])
			this.setData(data)
			return
		}
		else if (dtype === 'float64') {
			const data = new Float64Array(buf.slice(header_size))
			this.allocate(dims[0], dims[1], dims[2], dims[3], dims[4])
			this.setData(data)
			return
		}
		else if (dtype === 'int16') {
			const data = new Int16Array(buf.slice(header_size))
			this.allocate(dims[0], dims[1], dims[2], dims[3], dims[4])
			this.setData(data)
			return
		}
		else {
			throw Error('Unsupported dtype: ' + dtype)
		}
	}
	setFromBase64(x: string): void {
		this.setFromArrayBuffer(_base64ToArrayBuffer(x));
	}
	minimum(): number {
		if (this._data.length === 0) return 0
		var ret = this._data[0]
		for (let i = 0; i < this._data.length; i++) {
			if (this._data[i] < ret) ret = this._data[i]
		}
		return ret
	}
	maximum(): number {
		if (this._data.length === 0) return 0
		var ret = this._data[0]
		for (let i = 0; i < this._data.length; i++) {
			if (this._data[i] > ret) ret = this._data[i]
		}
		return ret
	}
	toList(): number[] {
		let A: number[] = []
		for (let a of this._data) A.push(a);
		return A
	}
}

function get_dtype_string(num: number): string {
	if (num === -2) return 'byte'
	if (num === -3) return 'float32'
	if (num === -4) return 'int16'
	if (num === -5) return 'int32'
	if (num === -6) return 'uint16'
	if (num === -7) return 'float64'
	return ''
}

function _base64ToArrayBuffer(base64: string): ArrayBuffer {
	var binary_string = window.atob(base64)
	var len = binary_string.length
	var bytes = new Uint8Array(len)
	for (var i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i)
	}
	return bytes.buffer
}

export default Mda