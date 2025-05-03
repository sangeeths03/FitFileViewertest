import {
	i as xe,
	t as nr,
	c as ht,
	D as gt,
	l as f,
	g as re,
	G as I,
	C as ns,
	f as H,
	o as cn,
	a as D,
	b as _e,
	d as de,
	r as dt,
	S as rr,
	e as le,
	h as fe,
	n as sr,
	j as or,
	k as L,
	m as $,
	p as S,
	q as Fe,
	u as ne,
	T as ir,
	s as v,
	v as _t,
	w as se,
	x as ve,
	y as Et,
	z as St,
	A,
	B as Ee,
	E as rs,
	F as Ae,
	H as te,
	I as ss,
	J as un,
	K as os,
	L as Gt,
	M as T,
	N as C,
	O as st,
	P as is,
	Q as Wt,
	R as be,
	U as ar,
	V as dn,
	W as as,
	X as cs,
	Y as us,
	_ as ds,
	Z as Yt,
	$ as At,
	a0 as ls,
	a1 as fs,
	a2 as ps,
	a3 as ln,
	a4 as Xt,
	a5 as fn,
	a6 as ms,
	a7 as zt,
	a8 as hs,
	a9 as lt,
	aa as cr,
	ab as pn,
	ac as Kt,
	ad as ee,
	ae as ce,
	af as mn,
	ag as ur,
	ah as dr,
	ai as lr,
	aj as ge,
	ak as fr,
	al as gs,
	am as _s,
	an as Ct,
	ao as Le,
	ap as Es,
	aq as pr,
	ar as hn,
	as as Ss,
	at as Vt,
	au as ys,
	av as Ts,
	aw as M,
	ax as Se,
	ay as mr,
	az as Ce,
	aA as vs,
	aB as ye,
	aC as gn,
	aD as yt,
	aE as bs,
	aF as Is,
	aG as _n,
	aH as En,
	aI as ks,
	aJ as ws,
	aK as Sn,
} from './index-LvWRIhnC.js';
(function () {
	try {
		var e =
				typeof window < 'u'
					? window
					: typeof global < 'u'
					? global
					: typeof self < 'u'
					? self
					: {},
			t = new Error().stack;
		t &&
			((e._sentryDebugIds = e._sentryDebugIds || {}),
			(e._sentryDebugIds[t] = 'e788f48d-123e-456f-b3ee-f15d4fc2cef7'),
			(e._sentryDebugIdIdentifier =
				'sentry-dbid-e788f48d-123e-456f-b3ee-f15d4fc2cef7'));
	} catch {}
})();
function Rs(e, t, n = 250, r, s, o, i) {
	if (
		!o.exception ||
		!o.exception.values ||
		!i ||
		!xe(i.originalException, Error)
	)
		return;
	const a =
		o.exception.values.length > 0
			? o.exception.values[o.exception.values.length - 1]
			: void 0;
	a &&
		(o.exception.values = Ns(
			Pt(e, t, s, i.originalException, r, o.exception.values, a, 0),
			n,
		));
}
function Pt(e, t, n, r, s, o, i, a) {
	if (o.length >= n + 1) return o;
	let c = [...o];
	if (xe(r[s], Error)) {
		yn(i, a);
		const u = e(t, r[s]),
			l = c.length;
		Tn(u, s, l, a), (c = Pt(e, t, n, r[s], s, [u, ...c], u, l));
	}
	return (
		Array.isArray(r.errors) &&
			r.errors.forEach((u, l) => {
				if (xe(u, Error)) {
					yn(i, a);
					const d = e(t, u),
						m = c.length;
					Tn(d, `errors[${l}]`, m, a), (c = Pt(e, t, n, u, s, [d, ...c], d, m));
				}
			}),
		c
	);
}
function yn(e, t) {
	(e.mechanism = e.mechanism || { type: 'generic', handled: !0 }),
		(e.mechanism = {
			...e.mechanism,
			...(e.type === 'AggregateError' && { is_exception_group: !0 }),
			exception_id: t,
		});
}
function Tn(e, t, n, r) {
	(e.mechanism = e.mechanism || { type: 'generic', handled: !0 }),
		(e.mechanism = {
			...e.mechanism,
			type: 'chained',
			source: t,
			exception_id: n,
			parent_id: r,
		});
}
function Ns(e, t) {
	return e.map((n) => (n.value && (n.value = nr(n.value, t)), n));
}
function hr(e) {
	if (e !== void 0)
		return e >= 400 && e < 500 ? 'warning' : e >= 500 ? 'error' : void 0;
}
const As = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Cs(e) {
	return e === 'http' || e === 'https';
}
function Me(e, t = !1) {
	const {
		host: n,
		path: r,
		pass: s,
		port: o,
		projectId: i,
		protocol: a,
		publicKey: c,
	} = e;
	return `${a}://${c}${t && s ? `:${s}` : ''}@${n}${o ? `:${o}` : ''}/${
		r && `${r}/`
	}${i}`;
}
function Ps(e) {
	const t = As.exec(e);
	if (!t) {
		ht(() => {
			console.error(`Invalid Sentry Dsn: ${e}`);
		});
		return;
	}
	const [n, r, s = '', o = '', i = '', a = ''] = t.slice(1);
	let c = '',
		u = a;
	const l = u.split('/');
	if ((l.length > 1 && ((c = l.slice(0, -1).join('/')), (u = l.pop())), u)) {
		const d = u.match(/^\d+/);
		d && (u = d[0]);
	}
	return gr({
		host: o,
		pass: s,
		path: c,
		projectId: u,
		port: i,
		protocol: n,
		publicKey: r,
	});
}
function gr(e) {
	return {
		protocol: e.protocol,
		publicKey: e.publicKey || '',
		pass: e.pass || '',
		host: e.host,
		port: e.port || '',
		path: e.path || '',
		projectId: e.projectId,
	};
}
function Os(e) {
	if (!gt) return !0;
	const { port: t, projectId: n, protocol: r } = e;
	return ['protocol', 'publicKey', 'host', 'projectId'].find((i) =>
		e[i] ? !1 : (f.error(`Invalid Sentry Dsn: ${i} missing`), !0),
	)
		? !1
		: n.match(/^\d+$/)
		? Cs(r)
			? t && isNaN(parseInt(t, 10))
				? (f.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1)
				: !0
			: (f.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1)
		: (f.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function xs(e) {
	const t = typeof e == 'string' ? Ps(e) : gr(e);
	if (!(!t || !Os(t))) return t;
}
class X extends Error {
	constructor(t, n = 'warn') {
		super(t),
			(this.message = t),
			(this.name = new.target.prototype.constructor.name),
			Object.setPrototypeOf(this, new.target.prototype),
			(this.logLevel = n);
	}
}
const ot = {},
	vn = {};
function oe(e, t) {
	(ot[e] = ot[e] || []), ot[e].push(t);
}
function ie(e, t) {
	if (!vn[e]) {
		vn[e] = !0;
		try {
			t();
		} catch (n) {
			gt && f.error(`Error while instrumenting ${e}`, n);
		}
	}
}
function j(e, t) {
	const n = e && ot[e];
	if (n)
		for (const r of n)
			try {
				r(t);
			} catch (s) {
				gt &&
					f.error(
						`Error while triggering instrumentation handler.
Type: ${e}
Name: ${re(r)}
Error:`,
						s,
					);
			}
}
function Fs(e) {
	const t = 'console';
	oe(t, e), ie(t, Ls);
}
function Ls() {
	'console' in I &&
		ns.forEach(function (e) {
			e in I.console &&
				H(I.console, e, function (t) {
					return (
						(cn[e] = t),
						function (...n) {
							j('console', { args: n, level: e });
							const s = cn[e];
							s && s.apply(I.console, n);
						}
					);
				});
		});
}
const Ot = I;
function _r() {
	if (!('fetch' in Ot)) return !1;
	try {
		return (
			new Headers(), new Request('http://www.example.com'), new Response(), !0
		);
	} catch {
		return !1;
	}
}
function xt(e) {
	return (
		e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString())
	);
}
function Er() {
	if (typeof EdgeRuntime == 'string') return !0;
	if (!_r()) return !1;
	if (xt(Ot.fetch)) return !0;
	let e = !1;
	const t = Ot.document;
	if (t && typeof t.createElement == 'function')
		try {
			const n = t.createElement('iframe');
			(n.hidden = !0),
				t.head.appendChild(n),
				n.contentWindow &&
					n.contentWindow.fetch &&
					(e = xt(n.contentWindow.fetch)),
				t.head.removeChild(n);
		} catch (n) {
			gt &&
				f.warn(
					'Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ',
					n,
				);
		}
	return e;
}
function Jt(e, t) {
	const n = 'fetch';
	oe(n, e), ie(n, () => Sr(void 0, t));
}
function Ds(e) {
	const t = 'fetch-body-resolved';
	oe(t, e), ie(t, () => Sr(Ms));
}
function Sr(e, t = !1) {
	(t && !Er()) ||
		H(I, 'fetch', function (n) {
			return function (...r) {
				const { method: s, url: o } = Hs(r),
					i = {
						args: r,
						fetchData: { method: s, url: o },
						startTimestamp: D() * 1e3,
					};
				e || j('fetch', { ...i });
				const a = new Error().stack;
				return n.apply(I, r).then(
					async (c) => (
						e
							? e(c)
							: j('fetch', { ...i, endTimestamp: D() * 1e3, response: c }),
						c
					),
					(c) => {
						throw (
							(j('fetch', { ...i, endTimestamp: D() * 1e3, error: c }),
							_e(c) &&
								c.stack === void 0 &&
								((c.stack = a), de(c, 'framesToPop', 1)),
							c)
						);
					},
				);
			};
		});
}
async function $s(e, t) {
	if (e && e.body) {
		const n = e.body,
			r = n.getReader(),
			s = setTimeout(() => {
				n.cancel().then(null, () => {});
			}, 90 * 1e3);
		let o = !0;
		for (; o; ) {
			let i;
			try {
				i = setTimeout(() => {
					n.cancel().then(null, () => {});
				}, 5e3);
				const { done: a } = await r.read();
				clearTimeout(i), a && (t(), (o = !1));
			} catch {
				o = !1;
			} finally {
				clearTimeout(i);
			}
		}
		clearTimeout(s), r.releaseLock(), n.cancel().then(null, () => {});
	}
}
function Ms(e) {
	let t;
	try {
		t = e.clone();
	} catch {
		return;
	}
	$s(t, () => {
		j('fetch-body-resolved', { endTimestamp: D() * 1e3, response: e });
	});
}
function Ft(e, t) {
	return !!e && typeof e == 'object' && !!e[t];
}
function bn(e) {
	return typeof e == 'string'
		? e
		: e
		? Ft(e, 'url')
			? e.url
			: e.toString
			? e.toString()
			: ''
		: '';
}
function Hs(e) {
	if (e.length === 0) return { method: 'GET', url: '' };
	if (e.length === 2) {
		const [n, r] = e;
		return {
			url: bn(n),
			method: Ft(r, 'method') ? String(r.method).toUpperCase() : 'GET',
		};
	}
	const t = e[0];
	return {
		url: bn(t),
		method: Ft(t, 'method') ? String(t.method).toUpperCase() : 'GET',
	};
}
let Ve = null;
function yr(e) {
	const t = 'error';
	oe(t, e), ie(t, Us);
}
function Us() {
	(Ve = I.onerror),
		(I.onerror = function (e, t, n, r, s) {
			return (
				j('error', { column: r, error: s, line: n, msg: e, url: t }),
				Ve && !Ve.__SENTRY_LOADER__ ? Ve.apply(this, arguments) : !1
			);
		}),
		(I.onerror.__SENTRY_INSTRUMENTED__ = !0);
}
let Je = null;
function Tr(e) {
	const t = 'unhandledrejection';
	oe(t, e), ie(t, Bs);
}
function Bs() {
	(Je = I.onunhandledrejection),
		(I.onunhandledrejection = function (e) {
			return (
				j('unhandledrejection', e),
				Je && !Je.__SENTRY_LOADER__ ? Je.apply(this, arguments) : !0
			);
		}),
		(I.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0);
}
function qs() {
	return 'npm';
}
function js(e) {
	const t = [];
	function n() {
		return e === void 0 || t.length < e;
	}
	function r(i) {
		return t.splice(t.indexOf(i), 1)[0] || Promise.resolve(void 0);
	}
	function s(i) {
		if (!n())
			return dt(new X('Not adding Promise because buffer limit was reached.'));
		const a = i();
		return (
			t.indexOf(a) === -1 && t.push(a),
			a.then(() => r(a)).then(null, () => r(a).then(null, () => {})),
			a
		);
	}
	function o(i) {
		return new rr((a, c) => {
			let u = t.length;
			if (!u) return a(!0);
			const l = setTimeout(() => {
				i && i > 0 && a(!1);
			}, i);
			t.forEach((d) => {
				le(d).then(() => {
					--u || (clearTimeout(l), a(!0));
				}, c);
			});
		});
	}
	return { $: t, add: s, drain: o };
}
function ue(e) {
	if (!e) return {};
	const t = e.match(
		/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/,
	);
	if (!t) return {};
	const n = t[6] || '',
		r = t[8] || '';
	return {
		host: t[4],
		path: t[5],
		protocol: t[2],
		search: n,
		hash: r,
		relative: t[5] + n + r,
	};
}
const Gs = ['fatal', 'error', 'warning', 'log', 'info', 'debug'];
function Ws(e) {
	return e === 'warn' ? 'warning' : Gs.includes(e) ? e : 'log';
}
function Ie(e, t = []) {
	return [e, t];
}
function Ys(e, t) {
	const [n, r] = e;
	return [n, [...r, t]];
}
function In(e, t) {
	const n = e[1];
	for (const r of n) {
		const s = r[0].type;
		if (t(r, s)) return !0;
	}
	return !1;
}
function Lt(e) {
	return I.__SENTRY__ && I.__SENTRY__.encodePolyfill
		? I.__SENTRY__.encodePolyfill(e)
		: new TextEncoder().encode(e);
}
function Xs(e) {
	const [t, n] = e;
	let r = JSON.stringify(t);
	function s(o) {
		typeof r == 'string'
			? (r = typeof o == 'string' ? r + o : [Lt(r), o])
			: r.push(typeof o == 'string' ? Lt(o) : o);
	}
	for (const o of n) {
		const [i, a] = o;
		if (
			(s(`
${JSON.stringify(i)}
`),
			typeof a == 'string' || a instanceof Uint8Array)
		)
			s(a);
		else {
			let c;
			try {
				c = JSON.stringify(a);
			} catch {
				c = JSON.stringify(sr(a));
			}
			s(c);
		}
	}
	return typeof r == 'string' ? r : zs(r);
}
function zs(e) {
	const t = e.reduce((s, o) => s + o.length, 0),
		n = new Uint8Array(t);
	let r = 0;
	for (const s of e) n.set(s, r), (r += s.length);
	return n;
}
function Ks(e) {
	return [{ type: 'span' }, e];
}
function Vs(e) {
	const t = typeof e.data == 'string' ? Lt(e.data) : e.data;
	return [
		fe({
			type: 'attachment',
			length: t.length,
			filename: e.filename,
			content_type: e.contentType,
			attachment_type: e.attachmentType,
		}),
		t,
	];
}
const Js = {
	session: 'session',
	sessions: 'session',
	attachment: 'attachment',
	transaction: 'transaction',
	event: 'error',
	client_report: 'internal',
	user_report: 'default',
	profile: 'profile',
	profile_chunk: 'profile',
	replay_event: 'replay',
	replay_recording: 'replay',
	check_in: 'monitor',
	feedback: 'feedback',
	span: 'span',
	statsd: 'metric_bucket',
};
function kn(e) {
	return Js[e];
}
function vr(e) {
	if (!e || !e.sdk) return;
	const { name: t, version: n } = e.sdk;
	return { name: t, version: n };
}
function Zs(e, t, n, r) {
	const s =
		e.sdkProcessingMetadata && e.sdkProcessingMetadata.dynamicSamplingContext;
	return {
		event_id: e.event_id,
		sent_at: new Date().toISOString(),
		...(t && { sdk: t }),
		...(!!n && r && { dsn: Me(r) }),
		...(s && { trace: fe({ ...s }) }),
	};
}
function Qs(e, t, n) {
	const r = [
		{ type: 'client_report' },
		{ timestamp: or(), discarded_events: e },
	];
	return Ie(t ? { dsn: t } : {}, [r]);
}
const eo = 60 * 1e3;
function to(e, t = Date.now()) {
	const n = parseInt(`${e}`, 10);
	if (!isNaN(n)) return n * 1e3;
	const r = Date.parse(`${e}`);
	return isNaN(r) ? eo : r - t;
}
function no(e, t) {
	return e[t] || e.all || 0;
}
function ro(e, t, n = Date.now()) {
	return no(e, t) > n;
}
function so(e, { statusCode: t, headers: n }, r = Date.now()) {
	const s = { ...e },
		o = n && n['x-sentry-rate-limits'],
		i = n && n['retry-after'];
	if (o)
		for (const a of o.trim().split(',')) {
			const [c, u, , , l] = a.split(':', 5),
				d = parseInt(c, 10),
				m = (isNaN(d) ? 60 : d) * 1e3;
			if (!u) s.all = r + m;
			else
				for (const h of u.split(';'))
					h === 'metric_bucket'
						? (!l || l.split(';').includes('custom')) && (s[h] = r + m)
						: (s[h] = r + m);
		}
	else i ? (s.all = r + to(i, r)) : t === 429 && (s.all = r + 60 * 1e3);
	return s;
}
const Ze = I;
function oo() {
	const e = Ze.chrome,
		t = e && e.app && e.app.runtime,
		n = 'history' in Ze && !!Ze.history.pushState && !!Ze.history.replaceState;
	return !t && n;
}
function K(e) {
	let t,
		n = e[0],
		r = 1;
	for (; r < e.length; ) {
		const s = e[r],
			o = e[r + 1];
		if (
			((r += 2), (s === 'optionalAccess' || s === 'optionalCall') && n == null)
		)
			return;
		s === 'access' || s === 'optionalAccess'
			? ((t = n), (n = o(n)))
			: (s === 'call' || s === 'optionalCall') &&
			  ((n = o((...i) => n.call(t, ...i))), (t = void 0));
	}
	return n;
}
let wn = !1;
function io() {
	wn || ((wn = !0), yr(Dt), Tr(Dt));
}
function Dt() {
	const e = L(),
		t = e && $(e);
	if (t) {
		const n = 'internal_error';
		S && f.log(`[Tracing] Root span: ${n} -> Global error occurred`),
			t.setStatus({ code: Fe, message: n });
	}
}
Dt.tag = 'sentry_tracingErrorCallback';
const br = '_sentryScope',
	Ir = '_sentryIsolationScope';
function ao(e, t, n) {
	e && (de(e, Ir, n), de(e, br, t));
}
function Rn(e) {
	return { scope: e[br], isolationScope: e[Ir] };
}
class ke {
	constructor(t = {}) {
		(this._traceId = t.traceId || ne()),
			(this._spanId = t.spanId || ne().substring(16));
	}
	spanContext() {
		return { spanId: this._spanId, traceId: this._traceId, traceFlags: ir };
	}
	end(t) {}
	setAttribute(t, n) {
		return this;
	}
	setAttributes(t) {
		return this;
	}
	setStatus(t) {
		return this;
	}
	updateName(t) {
		return this;
	}
	isRecording() {
		return !1;
	}
	addEvent(t, n, r) {
		return this;
	}
	addLink(t) {
		return this;
	}
	addLinks(t) {
		return this;
	}
	recordException(t, n) {}
}
function co(e) {
	if (!S) return;
	const {
			description: t = '< unknown name >',
			op: n = '< unknown op >',
			parent_span_id: r,
		} = v(e),
		{ spanId: s } = e.spanContext(),
		o = _t(e),
		i = $(e),
		a = i === e,
		c = `[Tracing] Starting ${o ? 'sampled' : 'unsampled'} ${
			a ? 'root ' : ''
		}span`,
		u = [`op: ${n}`, `name: ${t}`, `ID: ${s}`];
	if ((r && u.push(`parent ID: ${r}`), !a)) {
		const { op: l, description: d } = v(i);
		u.push(`root ID: ${i.spanContext().spanId}`),
			l && u.push(`root op: ${l}`),
			d && u.push(`root description: ${d}`);
	}
	f.log(`${c}
  ${u.join(`
  `)}`);
}
function uo(e) {
	if (!S) return;
	const { description: t = '< unknown name >', op: n = '< unknown op >' } =
			v(e),
		{ spanId: r } = e.spanContext(),
		o = $(e) === e,
		i = `[Tracing] Finishing "${n}" ${
			o ? 'root ' : ''
		}span "${t}" with ID ${r}`;
	f.log(i);
}
function kr(e) {
	if (typeof e == 'boolean') return Number(e);
	const t = typeof e == 'string' ? parseFloat(e) : e;
	if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
		S &&
			f.warn(
				`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
					e,
				)} of type ${JSON.stringify(typeof e)}.`,
			);
		return;
	}
	return t;
}
function lo(e, t) {
	if (!se(e)) return [!1];
	let n;
	typeof e.tracesSampler == 'function'
		? (n = e.tracesSampler(t))
		: t.parentSampled !== void 0
		? (n = t.parentSampled)
		: typeof e.tracesSampleRate < 'u'
		? (n = e.tracesSampleRate)
		: (n = 1);
	const r = kr(n);
	return r === void 0
		? (S &&
				f.warn(
					'[Tracing] Discarding transaction because of invalid sample rate.',
				),
		  [!1])
		: r
		? Math.random() < r
			? [!0, r]
			: (S &&
					f.log(
						`[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(
							n,
						)})`,
					),
			  [!1, r])
		: (S &&
				f.log(
					`[Tracing] Discarding transaction because ${
						typeof e.tracesSampler == 'function'
							? 'tracesSampler returned 0 or false'
							: 'a negative sampling decision was inherited or tracesSampleRate is set to 0'
					}`,
				),
		  [!1, r]);
}
function fo(e, t) {
	return (
		t &&
			((e.sdk = e.sdk || {}),
			(e.sdk.name = e.sdk.name || t.name),
			(e.sdk.version = e.sdk.version || t.version),
			(e.sdk.integrations = [
				...(e.sdk.integrations || []),
				...(t.integrations || []),
			]),
			(e.sdk.packages = [...(e.sdk.packages || []), ...(t.packages || [])])),
		e
	);
}
function po(e, t, n, r) {
	const s = vr(n),
		o = {
			sent_at: new Date().toISOString(),
			...(s && { sdk: s }),
			...(!!r && t && { dsn: Me(t) }),
		},
		i =
			'aggregates' in e
				? [{ type: 'sessions' }, e]
				: [{ type: 'session' }, e.toJSON()];
	return Ie(o, [i]);
}
function mo(e, t, n, r) {
	const s = vr(n),
		o = e.type && e.type !== 'replay_event' ? e.type : 'event';
	fo(e, n && n.sdk);
	const i = Zs(e, s, r, t);
	return delete e.sdkProcessingMetadata, Ie(i, [[{ type: o }, e]]);
}
function ho(e, t) {
	function n(l) {
		return !!l.trace_id && !!l.public_key;
	}
	const r = ve(e[0]),
		s = t && t.getDsn(),
		o = t && t.getOptions().tunnel,
		i = {
			sent_at: new Date().toISOString(),
			...(n(r) && { trace: r }),
			...(!!o && s && { dsn: Me(s) }),
		},
		a = t && t.getOptions().beforeSendSpan,
		c = a ? (l) => a(v(l)) : (l) => v(l),
		u = [];
	for (const l of e) {
		const d = c(l);
		d && u.push(Ks(d));
	}
	return Ie(i, u);
}
function go(e, t, n, r = L()) {
	const s = r && $(r);
	s && s.addEvent(e, { [Et]: t, [St]: n });
}
function Nn(e) {
	if (!e || e.length === 0) return;
	const t = {};
	return (
		e.forEach((n) => {
			const r = n.attributes || {},
				s = r[St],
				o = r[Et];
			typeof s == 'string' &&
				typeof o == 'number' &&
				(t[n.name] = { value: o, unit: s });
		}),
		t
	);
}
const An = 1e3;
class Zt {
	constructor(t = {}) {
		(this._traceId = t.traceId || ne()),
			(this._spanId = t.spanId || ne().substring(16)),
			(this._startTime = t.startTimestamp || D()),
			(this._attributes = {}),
			this.setAttributes({ [A]: 'manual', [Ee]: t.op, ...t.attributes }),
			(this._name = t.name),
			t.parentSpanId && (this._parentSpanId = t.parentSpanId),
			'sampled' in t && (this._sampled = t.sampled),
			t.endTimestamp && (this._endTime = t.endTimestamp),
			(this._events = []),
			(this._isStandaloneSpan = t.isStandalone),
			this._endTime && this._onSpanEnded();
	}
	addLink(t) {
		return this;
	}
	addLinks(t) {
		return this;
	}
	recordException(t, n) {}
	spanContext() {
		const { _spanId: t, _traceId: n, _sampled: r } = this;
		return { spanId: t, traceId: n, traceFlags: r ? rs : ir };
	}
	setAttribute(t, n) {
		return (
			n === void 0 ? delete this._attributes[t] : (this._attributes[t] = n),
			this
		);
	}
	setAttributes(t) {
		return Object.keys(t).forEach((n) => this.setAttribute(n, t[n])), this;
	}
	updateStartTime(t) {
		this._startTime = Ae(t);
	}
	setStatus(t) {
		return (this._status = t), this;
	}
	updateName(t) {
		return (this._name = t), this.setAttribute(te, 'custom'), this;
	}
	end(t) {
		this._endTime || ((this._endTime = Ae(t)), uo(this), this._onSpanEnded());
	}
	getSpanJSON() {
		return fe({
			data: this._attributes,
			description: this._name,
			op: this._attributes[Ee],
			parent_span_id: this._parentSpanId,
			span_id: this._spanId,
			start_timestamp: this._startTime,
			status: ss(this._status),
			timestamp: this._endTime,
			trace_id: this._traceId,
			origin: this._attributes[A],
			_metrics_summary: un(this),
			profile_id: this._attributes[os],
			exclusive_time: this._attributes[Gt],
			measurements: Nn(this._events),
			is_segment: (this._isStandaloneSpan && $(this) === this) || void 0,
			segment_id: this._isStandaloneSpan
				? $(this).spanContext().spanId
				: void 0,
		});
	}
	isRecording() {
		return !this._endTime && !!this._sampled;
	}
	addEvent(t, n, r) {
		S && f.log('[Tracing] Adding an event to span:', t);
		const s = Cn(n) ? n : r || D(),
			o = Cn(n) ? {} : n || {},
			i = { name: t, time: Ae(s), attributes: o };
		return this._events.push(i), this;
	}
	isStandaloneSpan() {
		return !!this._isStandaloneSpan;
	}
	_onSpanEnded() {
		const t = T();
		if (
			(t && t.emit('spanEnd', this),
			!(this._isStandaloneSpan || this === $(this)))
		)
			return;
		if (this._isStandaloneSpan) {
			this._sampled
				? Eo(ho([this], t))
				: (S &&
						f.log(
							'[Tracing] Discarding standalone span because its trace was not chosen to be sampled.',
						),
				  t && t.recordDroppedEvent('sample_rate', 'span'));
			return;
		}
		const r = this._convertSpanToTransaction();
		r && (Rn(this).scope || C()).captureEvent(r);
	}
	_convertSpanToTransaction() {
		if (!Pn(v(this))) return;
		this._name ||
			(S &&
				f.warn(
					'Transaction has no name, falling back to `<unlabeled transaction>`.',
				),
			(this._name = '<unlabeled transaction>'));
		const { scope: t, isolationScope: n } = Rn(this),
			s = (t || C()).getClient() || T();
		if (this._sampled !== !0) {
			S &&
				f.log(
					'[Tracing] Discarding transaction because its trace was not chosen to be sampled.',
				),
				s && s.recordDroppedEvent('sample_rate', 'transaction');
			return;
		}
		const i = st(this)
				.filter((d) => d !== this && !_o(d))
				.map((d) => v(d))
				.filter(Pn),
			a = this._attributes[te],
			c = {
				contexts: { trace: is(this) },
				spans:
					i.length > An
						? i
								.sort((d, m) => d.start_timestamp - m.start_timestamp)
								.slice(0, An)
						: i,
				start_timestamp: this._startTime,
				timestamp: this._endTime,
				transaction: this._name,
				type: 'transaction',
				sdkProcessingMetadata: {
					capturedSpanScope: t,
					capturedSpanIsolationScope: n,
					...fe({ dynamicSamplingContext: ve(this) }),
				},
				_metrics_summary: un(this),
				...(a && { transaction_info: { source: a } }),
			},
			u = Nn(this._events);
		return (
			u &&
				Object.keys(u).length &&
				(S &&
					f.log(
						'[Measurements] Adding measurements to transaction event',
						JSON.stringify(u, void 0, 2),
					),
				(c.measurements = u)),
			c
		);
	}
}
function Cn(e) {
	return (e && typeof e == 'number') || e instanceof Date || Array.isArray(e);
}
function Pn(e) {
	return !!e.start_timestamp && !!e.timestamp && !!e.span_id && !!e.trace_id;
}
function _o(e) {
	return e instanceof Zt && e.isStandaloneSpan();
}
function Eo(e) {
	const t = T();
	if (!t) return;
	const n = e[1];
	if (!n || n.length === 0) {
		t.recordDroppedEvent('before_send', 'span');
		return;
	}
	t.sendEnvelope(e);
}
const wr = '__SENTRY_SUPPRESS_TRACING__';
function He(e) {
	const t = Nr();
	if (t.startInactiveSpan) return t.startInactiveSpan(e);
	const n = yo(e),
		{ forceTransaction: r, parentSpan: s } = e;
	return (
		e.scope
			? (i) => Wt(e.scope, i)
			: s !== void 0
			? (i) => Rr(s, i)
			: (i) => i()
	)(() => {
		const i = C(),
			a = vo(i);
		return e.onlyIfParent && !a
			? new ke()
			: So({ parentSpan: a, spanArguments: n, forceTransaction: r, scope: i });
	});
}
function Rr(e, t) {
	const n = Nr();
	return n.withActiveSpan
		? n.withActiveSpan(e, t)
		: Wt((r) => (Yt(r, e || void 0), t(r)));
}
function So({
	parentSpan: e,
	spanArguments: t,
	forceTransaction: n,
	scope: r,
}) {
	if (!se()) return new ke();
	const s = be();
	let o;
	if (e && !n) (o = To(e, r, t)), ar(e, o);
	else if (e) {
		const i = ve(e),
			{ traceId: a, spanId: c } = e.spanContext(),
			u = _t(e);
		(o = On({ traceId: a, parentSpanId: c, ...t }, r, u)), dn(o, i);
	} else {
		const {
			traceId: i,
			dsc: a,
			parentSpanId: c,
			sampled: u,
		} = { ...s.getPropagationContext(), ...r.getPropagationContext() };
		(o = On({ traceId: i, parentSpanId: c, ...t }, r, u)), a && dn(o, a);
	}
	return co(o), ao(o, r, s), o;
}
function yo(e) {
	const n = { isStandalone: (e.experimental || {}).standalone, ...e };
	if (e.startTime) {
		const r = { ...n };
		return (r.startTimestamp = Ae(e.startTime)), delete r.startTime, r;
	}
	return n;
}
function Nr() {
	const e = as();
	return cs(e);
}
function On(e, t, n) {
	const r = T(),
		s = (r && r.getOptions()) || {},
		{ name: o = '', attributes: i } = e,
		[a, c] = t.getScopeData().sdkProcessingMetadata[wr]
			? [!1]
			: lo(s, {
					name: o,
					parentSampled: n,
					attributes: i,
					transactionContext: { name: o, parentSampled: n },
			  }),
		u = new Zt({
			...e,
			attributes: { [te]: 'custom', ...e.attributes },
			sampled: a,
		});
	return c !== void 0 && u.setAttribute(us, c), r && r.emit('spanStart', u), u;
}
function To(e, t, n) {
	const { spanId: r, traceId: s } = e.spanContext(),
		o = t.getScopeData().sdkProcessingMetadata[wr] ? !1 : _t(e),
		i = o
			? new Zt({ ...n, parentSpanId: r, traceId: s, sampled: o })
			: new ke({ traceId: s });
	ar(e, i);
	const a = T();
	return (
		a && (a.emit('spanStart', i), n.endTimestamp && a.emit('spanEnd', i)), i
	);
}
function vo(e) {
	const t = ds(e);
	if (!t) return;
	const n = T();
	return (n ? n.getOptions() : {}).parentSpanIsAlwaysRootSpan ? $(t) : t;
}
const it = { idleTimeout: 1e3, finalTimeout: 3e4, childSpanTimeout: 15e3 },
	bo = 'heartbeatFailed',
	Io = 'idleTimeout',
	ko = 'finalTimeout',
	wo = 'externalFinish';
function Ar(e, t = {}) {
	const n = new Map();
	let r = !1,
		s,
		o = wo,
		i = !t.disableAutoFinish;
	const a = [],
		{
			idleTimeout: c = it.idleTimeout,
			finalTimeout: u = it.finalTimeout,
			childSpanTimeout: l = it.childSpanTimeout,
			beforeSpanEnd: d,
		} = t,
		m = T();
	if (!m || !se()) return new ke();
	const h = C(),
		p = L(),
		_ = Ro(e);
	_.end = new Proxy(_.end, {
		apply(y, w, b) {
			d && d(_);
			const [O, ...q] = b,
				x = O || D(),
				R = Ae(x),
				Ye = st(_).filter((Q) => Q !== _);
			if (!Ye.length) return P(R), Reflect.apply(y, w, [R, ...q]);
			const Xe = Ye.map((Q) => v(Q).timestamp).filter((Q) => !!Q),
				ze = Xe.length ? Math.max(...Xe) : void 0,
				he = v(_).start_timestamp,
				Ke = Math.min(
					he ? he + u / 1e3 : 1 / 0,
					Math.max(he || -1 / 0, Math.min(R, ze || 1 / 0)),
				);
			return P(Ke), Reflect.apply(y, w, [Ke, ...q]);
		},
	});
	function G() {
		s && (clearTimeout(s), (s = void 0));
	}
	function B(y) {
		G(),
			(s = setTimeout(() => {
				!r && n.size === 0 && i && ((o = Io), _.end(y));
			}, c));
	}
	function J(y) {
		s = setTimeout(() => {
			!r && i && ((o = bo), _.end(y));
		}, l);
	}
	function Z(y) {
		G(), n.set(y, !0);
		const w = D();
		J(w + l / 1e3);
	}
	function We(y) {
		if ((n.has(y) && n.delete(y), n.size === 0)) {
			const w = D();
			B(w + c / 1e3);
		}
	}
	function P(y) {
		(r = !0), n.clear(), a.forEach((R) => R()), Yt(h, p);
		const w = v(_),
			{ start_timestamp: b } = w;
		if (!b) return;
		(w.data || {})[At] || _.setAttribute(At, o),
			f.log(`[Tracing] Idle span "${w.op}" finished`);
		const q = st(_).filter((R) => R !== _);
		let x = 0;
		q.forEach((R) => {
			R.isRecording() &&
				(R.setStatus({ code: Fe, message: 'cancelled' }),
				R.end(y),
				S &&
					f.log(
						'[Tracing] Cancelling span since span ended early',
						JSON.stringify(R, void 0, 2),
					));
			const Ye = v(R),
				{ timestamp: Xe = 0, start_timestamp: ze = 0 } = Ye,
				he = ze <= y,
				Ke = (u + c) / 1e3,
				Q = Xe - ze <= Ke;
			if (S) {
				const an = JSON.stringify(R, void 0, 2);
				he
					? Q ||
					  f.log(
							'[Tracing] Discarding span since it finished after idle span final timeout',
							an,
					  )
					: f.log(
							'[Tracing] Discarding span since it happened after idle span was finished',
							an,
					  );
			}
			(!Q || !he) && (ls(_, R), x++);
		}),
			x > 0 && _.setAttribute('sentry.idle_span_discarded_spans', x);
	}
	return (
		a.push(
			m.on('spanStart', (y) => {
				if (r || y === _ || v(y).timestamp) return;
				st(_).includes(y) && Z(y.spanContext().spanId);
			}),
		),
		a.push(
			m.on('spanEnd', (y) => {
				r || We(y.spanContext().spanId);
			}),
		),
		a.push(
			m.on('idleSpanEnableAutoFinish', (y) => {
				y === _ && ((i = !0), B(), n.size && J());
			}),
		),
		t.disableAutoFinish || B(),
		setTimeout(() => {
			r ||
				(_.setStatus({ code: Fe, message: 'deadline_exceeded' }),
				(o = ko),
				_.end());
		}, u),
		_
	);
}
function Ro(e) {
	const t = He(e);
	return Yt(C(), t), S && f.log('[Tracing] Started span is an idle span'), t;
}
const No = '7';
function Ao(e) {
	const t = e.protocol ? `${e.protocol}:` : '',
		n = e.port ? `:${e.port}` : '';
	return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ''}/api/`;
}
function Co(e) {
	return `${Ao(e)}${e.projectId}/envelope/`;
}
function Po(e, t) {
	return fs({
		sentry_key: e.publicKey,
		sentry_version: No,
		...(t && { sentry_client: `${t.name}/${t.version}` }),
	});
}
function Oo(e, t, n) {
	return t || `${Co(e)}?${Po(e, n)}`;
}
const xn = [];
function xo(e) {
	const t = {};
	return (
		e.forEach((n) => {
			const { name: r } = n,
				s = t[r];
			(s && !s.isDefaultInstance && n.isDefaultInstance) || (t[r] = n);
		}),
		Object.values(t)
	);
}
function Fo(e) {
	const t = e.defaultIntegrations || [],
		n = e.integrations;
	t.forEach((i) => {
		i.isDefaultInstance = !0;
	});
	let r;
	Array.isArray(n)
		? (r = [...t, ...n])
		: typeof n == 'function'
		? (r = ps(n(t)))
		: (r = t);
	const s = xo(r),
		o = s.findIndex((i) => i.name === 'Debug');
	if (o > -1) {
		const [i] = s.splice(o, 1);
		s.push(i);
	}
	return s;
}
function Lo(e, t) {
	const n = {};
	return (
		t.forEach((r) => {
			r && Cr(e, r, n);
		}),
		n
	);
}
function Fn(e, t) {
	for (const n of t) n && n.afterAllSetup && n.afterAllSetup(e);
}
function Cr(e, t, n) {
	if (n[t.name]) {
		S &&
			f.log(`Integration skipped because it was already installed: ${t.name}`);
		return;
	}
	if (
		((n[t.name] = t),
		xn.indexOf(t.name) === -1 &&
			typeof t.setupOnce == 'function' &&
			(t.setupOnce(), xn.push(t.name)),
		t.setup && typeof t.setup == 'function' && t.setup(e),
		typeof t.preprocessEvent == 'function')
	) {
		const r = t.preprocessEvent.bind(t);
		e.on('preprocessEvent', (s, o) => r(s, o, e));
	}
	if (typeof t.processEvent == 'function') {
		const r = t.processEvent.bind(t),
			s = Object.assign((o, i) => r(o, i, e), { id: t.name });
		e.addEventProcessor(s);
	}
	S && f.log(`Integration installed: ${t.name}`);
}
const Ln = "Not capturing exception because it's already been captured.";
class Do {
	constructor(t) {
		if (
			((this._options = t),
			(this._integrations = {}),
			(this._numProcessing = 0),
			(this._outcomes = {}),
			(this._hooks = {}),
			(this._eventProcessors = []),
			t.dsn
				? (this._dsn = xs(t.dsn))
				: S && f.warn('No DSN provided, client will not send events.'),
			this._dsn)
		) {
			const n = Oo(this._dsn, t.tunnel, t._metadata ? t._metadata.sdk : void 0);
			this._transport = t.transport({
				tunnel: this._options.tunnel,
				recordDroppedEvent: this.recordDroppedEvent.bind(this),
				...t.transportOptions,
				url: n,
			});
		}
	}
	captureException(t, n, r) {
		const s = ne();
		if (ln(t)) return S && f.log(Ln), s;
		const o = { event_id: s, ...n };
		return (
			this._process(
				this.eventFromException(t, o).then((i) => this._captureEvent(i, o, r)),
			),
			o.event_id
		);
	}
	captureMessage(t, n, r, s) {
		const o = { event_id: ne(), ...r },
			i = cr(t) ? t : String(t),
			a = Xt(t)
				? this.eventFromMessage(i, n, o)
				: this.eventFromException(t, o);
		return (
			this._process(a.then((c) => this._captureEvent(c, o, s))), o.event_id
		);
	}
	captureEvent(t, n, r) {
		const s = ne();
		if (n && n.originalException && ln(n.originalException))
			return S && f.log(Ln), s;
		const o = { event_id: s, ...n },
			a = (t.sdkProcessingMetadata || {}).capturedSpanScope;
		return this._process(this._captureEvent(t, o, a || r)), o.event_id;
	}
	captureSession(t) {
		typeof t.release != 'string'
			? S &&
			  f.warn('Discarded session because of missing or non-string release')
			: (this.sendSession(t), fn(t, { init: !1 }));
	}
	getDsn() {
		return this._dsn;
	}
	getOptions() {
		return this._options;
	}
	getSdkMetadata() {
		return this._options._metadata;
	}
	getTransport() {
		return this._transport;
	}
	flush(t) {
		const n = this._transport;
		return n
			? (this.emit('flush'),
			  this._isClientDoneProcessing(t).then((r) =>
					n.flush(t).then((s) => r && s),
			  ))
			: le(!0);
	}
	close(t) {
		return this.flush(t).then(
			(n) => ((this.getOptions().enabled = !1), this.emit('close'), n),
		);
	}
	getEventProcessors() {
		return this._eventProcessors;
	}
	addEventProcessor(t) {
		this._eventProcessors.push(t);
	}
	init() {
		(this._isEnabled() ||
			this._options.integrations.some(({ name: t }) =>
				t.startsWith('Spotlight'),
			)) &&
			this._setupIntegrations();
	}
	getIntegrationByName(t) {
		return this._integrations[t];
	}
	addIntegration(t) {
		const n = this._integrations[t.name];
		Cr(this, t, this._integrations), n || Fn(this, [t]);
	}
	sendEvent(t, n = {}) {
		this.emit('beforeSendEvent', t, n);
		let r = mo(t, this._dsn, this._options._metadata, this._options.tunnel);
		for (const o of n.attachments || []) r = Ys(r, Vs(o));
		const s = this.sendEnvelope(r);
		s && s.then((o) => this.emit('afterSendEvent', t, o), null);
	}
	sendSession(t) {
		const n = po(t, this._dsn, this._options._metadata, this._options.tunnel);
		this.sendEnvelope(n);
	}
	recordDroppedEvent(t, n, r) {
		if (this._options.sendClientReports) {
			const s = typeof r == 'number' ? r : 1,
				o = `${t}:${n}`;
			S && f.log(`Recording outcome: "${o}"${s > 1 ? ` (${s} times)` : ''}`),
				(this._outcomes[o] = (this._outcomes[o] || 0) + s);
		}
	}
	on(t, n) {
		const r = (this._hooks[t] = this._hooks[t] || []);
		return (
			r.push(n),
			() => {
				const s = r.indexOf(n);
				s > -1 && r.splice(s, 1);
			}
		);
	}
	emit(t, ...n) {
		const r = this._hooks[t];
		r && r.forEach((s) => s(...n));
	}
	sendEnvelope(t) {
		return (
			this.emit('beforeEnvelope', t),
			this._isEnabled() && this._transport
				? this._transport
						.send(t)
						.then(
							null,
							(n) => (S && f.error('Error while sending envelope:', n), n),
						)
				: (S && f.error('Transport disabled'), le({}))
		);
	}
	_setupIntegrations() {
		const { integrations: t } = this._options;
		(this._integrations = Lo(this, t)), Fn(this, t);
	}
	_updateSessionFromEvent(t, n) {
		let r = !1,
			s = !1;
		const o = n.exception && n.exception.values;
		if (o) {
			s = !0;
			for (const c of o) {
				const u = c.mechanism;
				if (u && u.handled === !1) {
					r = !0;
					break;
				}
			}
		}
		const i = t.status === 'ok';
		((i && t.errors === 0) || (i && r)) &&
			(fn(t, {
				...(r && { status: 'crashed' }),
				errors: t.errors || Number(s || r),
			}),
			this.captureSession(t));
	}
	_isClientDoneProcessing(t) {
		return new rr((n) => {
			let r = 0;
			const s = 1,
				o = setInterval(() => {
					this._numProcessing == 0
						? (clearInterval(o), n(!0))
						: ((r += s), t && r >= t && (clearInterval(o), n(!1)));
				}, s);
		});
	}
	_isEnabled() {
		return this.getOptions().enabled !== !1 && this._transport !== void 0;
	}
	_prepareEvent(t, n, r, s = be()) {
		const o = this.getOptions(),
			i = Object.keys(this._integrations);
		return (
			!n.integrations && i.length > 0 && (n.integrations = i),
			this.emit('preprocessEvent', t, n),
			t.type || s.setLastEventId(t.event_id || n.event_id),
			ms(o, t, n, r, this, s).then((a) => {
				if (a === null) return a;
				const c = {
					...s.getPropagationContext(),
					...(r ? r.getPropagationContext() : void 0),
				};
				if (!(a.contexts && a.contexts.trace) && c) {
					const { traceId: l, spanId: d, parentSpanId: m, dsc: h } = c;
					a.contexts = {
						trace: fe({ trace_id: l, span_id: d, parent_span_id: m }),
						...a.contexts,
					};
					const p = h || zt(l, this);
					a.sdkProcessingMetadata = {
						dynamicSamplingContext: p,
						...a.sdkProcessingMetadata,
					};
				}
				return a;
			})
		);
	}
	_captureEvent(t, n = {}, r) {
		return this._processEvent(t, n, r).then(
			(s) => s.event_id,
			(s) => {
				if (S) {
					const o = s;
					o.logLevel === 'log' ? f.log(o.message) : f.warn(o);
				}
			},
		);
	}
	_processEvent(t, n, r) {
		const s = this.getOptions(),
			{ sampleRate: o } = s,
			i = Or(t),
			a = Pr(t),
			c = t.type || 'error',
			u = `before send for type \`${c}\``,
			l = typeof o > 'u' ? void 0 : kr(o);
		if (a && typeof l == 'number' && Math.random() > l)
			return (
				this.recordDroppedEvent('sample_rate', 'error', t),
				dt(
					new X(
						`Discarding event because it's not included in the random sample (sampling rate = ${o})`,
						'log',
					),
				)
			);
		const d = c === 'replay_event' ? 'replay' : c,
			h = (t.sdkProcessingMetadata || {}).capturedSpanIsolationScope;
		return this._prepareEvent(t, n, r, h)
			.then((p) => {
				if (p === null)
					throw (
						(this.recordDroppedEvent('event_processor', d, t),
						new X(
							'An event processor returned `null`, will not send event.',
							'log',
						))
					);
				if (n.data && n.data.__sentry__ === !0) return p;
				const G = Mo(this, s, p, n);
				return $o(G, u);
			})
			.then((p) => {
				if (p === null) {
					if ((this.recordDroppedEvent('before_send', d, t), i)) {
						const J = 1 + (t.spans || []).length;
						this.recordDroppedEvent('before_send', 'span', J);
					}
					throw new X(`${u} returned \`null\`, will not send event.`, 'log');
				}
				const _ = r && r.getSession();
				if ((!i && _ && this._updateSessionFromEvent(_, p), i)) {
					const B =
							(p.sdkProcessingMetadata &&
								p.sdkProcessingMetadata.spanCountBeforeProcessing) ||
							0,
						J = p.spans ? p.spans.length : 0,
						Z = B - J;
					Z > 0 && this.recordDroppedEvent('before_send', 'span', Z);
				}
				const G = p.transaction_info;
				if (i && G && p.transaction !== t.transaction) {
					const B = 'custom';
					p.transaction_info = { ...G, source: B };
				}
				return this.sendEvent(p, n), p;
			})
			.then(null, (p) => {
				throw p instanceof X
					? p
					: (this.captureException(p, {
							data: { __sentry__: !0 },
							originalException: p,
					  }),
					  new X(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${p}`));
			});
	}
	_process(t) {
		this._numProcessing++,
			t.then(
				(n) => (this._numProcessing--, n),
				(n) => (this._numProcessing--, n),
			);
	}
	_clearOutcomes() {
		const t = this._outcomes;
		return (
			(this._outcomes = {}),
			Object.entries(t).map(([n, r]) => {
				const [s, o] = n.split(':');
				return { reason: s, category: o, quantity: r };
			})
		);
	}
	_flushOutcomes() {
		S && f.log('Flushing outcomes...');
		const t = this._clearOutcomes();
		if (t.length === 0) {
			S && f.log('No outcomes to send');
			return;
		}
		if (!this._dsn) {
			S && f.log('No dsn provided, will not send outcomes');
			return;
		}
		S && f.log('Sending outcomes:', t);
		const n = Qs(t, this._options.tunnel && Me(this._dsn));
		this.sendEnvelope(n);
	}
}
function $o(e, t) {
	const n = `${t} must return \`null\` or a valid event.`;
	if (hs(e))
		return e.then(
			(r) => {
				if (!lt(r) && r !== null) throw new X(n);
				return r;
			},
			(r) => {
				throw new X(`${t} rejected with ${r}`);
			},
		);
	if (!lt(e) && e !== null) throw new X(n);
	return e;
}
function Mo(e, t, n, r) {
	const { beforeSend: s, beforeSendTransaction: o, beforeSendSpan: i } = t;
	if (Pr(n) && s) return s(n, r);
	if (Or(n)) {
		if (n.spans && i) {
			const a = [];
			for (const c of n.spans) {
				const u = i(c);
				u ? a.push(u) : e.recordDroppedEvent('before_send', 'span');
			}
			n.spans = a;
		}
		if (o) {
			if (n.spans) {
				const a = n.spans.length;
				n.sdkProcessingMetadata = {
					...n.sdkProcessingMetadata,
					spanCountBeforeProcessing: a,
				};
			}
			return o(n, r);
		}
	}
	return n;
}
function Pr(e) {
	return e.type === void 0;
}
function Or(e) {
	return e.type === 'transaction';
}
function Ho(e, t) {
	t.debug === !0 &&
		(S
			? f.enable()
			: ht(() => {
					console.warn(
						'[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.',
					);
			  })),
		C().update(t.initialScope);
	const r = new e(t);
	return Uo(r), r.init(), r;
}
function Uo(e) {
	C().setClient(e);
}
const Bo = 64;
function qo(e, t, n = js(e.bufferSize || Bo)) {
	let r = {};
	const s = (i) => n.drain(i);
	function o(i) {
		const a = [];
		if (
			(In(i, (d, m) => {
				const h = kn(m);
				if (ro(r, h)) {
					const p = Dn(d, m);
					e.recordDroppedEvent('ratelimit_backoff', h, p);
				} else a.push(d);
			}),
			a.length === 0)
		)
			return le({});
		const c = Ie(i[0], a),
			u = (d) => {
				In(c, (m, h) => {
					const p = Dn(m, h);
					e.recordDroppedEvent(d, kn(h), p);
				});
			},
			l = () =>
				t({ body: Xs(c) }).then(
					(d) => (
						d.statusCode !== void 0 &&
							(d.statusCode < 200 || d.statusCode >= 300) &&
							S &&
							f.warn(
								`Sentry responded with status code ${d.statusCode} to sent event.`,
							),
						(r = so(r, d)),
						d
					),
					(d) => {
						throw (u('network_error'), d);
					},
				);
		return n.add(l).then(
			(d) => d,
			(d) => {
				if (d instanceof X)
					return (
						S && f.error('Skipped sending event because buffer is full.'),
						u('queue_overflow'),
						le({})
					);
				throw d;
			},
		);
	}
	return { send: o, flush: s };
}
function Dn(e, t) {
	if (!(t !== 'event' && t !== 'transaction'))
		return Array.isArray(e) ? e[1] : void 0;
}
function jo(e, t) {
	const n = t && t.getDsn(),
		r = t && t.getOptions().tunnel;
	return Wo(e, n) || Go(e, r);
}
function Go(e, t) {
	return t ? $n(e) === $n(t) : !1;
}
function Wo(e, t) {
	return t ? e.includes(t.host) : !1;
}
function $n(e) {
	return e[e.length - 1] === '/' ? e.slice(0, -1) : e;
}
function Yo(e, t, n = [t], r = 'npm') {
	const s = e._metadata || {};
	s.sdk ||
		(s.sdk = {
			name: `sentry.javascript.${t}`,
			packages: n.map((o) => ({ name: `${r}:@sentry/${o}`, version: pn })),
			version: pn,
		}),
		(e._metadata = s);
}
const Xo = 100;
function pe(e, t) {
	const n = T(),
		r = be();
	if (!n) return;
	const { beforeBreadcrumb: s = null, maxBreadcrumbs: o = Xo } = n.getOptions();
	if (o <= 0) return;
	const a = { timestamp: or(), ...e },
		c = s ? ht(() => s(a, t)) : a;
	c !== null &&
		(n.emit && n.emit('beforeAddBreadcrumb', c, t), r.addBreadcrumb(c, o));
}
let Mn;
const zo = 'FunctionToString',
	Hn = new WeakMap(),
	Ko = () => ({
		name: zo,
		setupOnce() {
			Mn = Function.prototype.toString;
			try {
				Function.prototype.toString = function (...e) {
					const t = Kt(this),
						n = Hn.has(T()) && t !== void 0 ? t : this;
					return Mn.apply(n, e);
				};
			} catch {}
		},
		setup(e) {
			Hn.set(e, !0);
		},
	}),
	Vo = Ko,
	Jo = [
		/^Script error\.?$/,
		/^Javascript error: Script error\.? on line 0$/,
		/^ResizeObserver loop completed with undelivered notifications.$/,
		/^Cannot redefine property: googletag$/,
		"undefined is not an object (evaluating 'a.L')",
		`can't redefine non-configurable property "solana"`,
		"vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
		"Can't find variable: _AutofillCallbackHandler",
	],
	Zo = 'InboundFilters',
	Qo = (e = {}) => ({
		name: Zo,
		processEvent(t, n, r) {
			const s = r.getOptions(),
				o = ti(e, s);
			return ni(t, o) ? null : t;
		},
	}),
	ei = Qo;
function ti(e = {}, t = {}) {
	return {
		allowUrls: [...(e.allowUrls || []), ...(t.allowUrls || [])],
		denyUrls: [...(e.denyUrls || []), ...(t.denyUrls || [])],
		ignoreErrors: [
			...(e.ignoreErrors || []),
			...(t.ignoreErrors || []),
			...(e.disableErrorDefaults ? [] : Jo),
		],
		ignoreTransactions: [
			...(e.ignoreTransactions || []),
			...(t.ignoreTransactions || []),
		],
		ignoreInternal: e.ignoreInternal !== void 0 ? e.ignoreInternal : !0,
	};
}
function ni(e, t) {
	return t.ignoreInternal && ci(e)
		? (S &&
				f.warn(`Event dropped due to being internal Sentry Error.
Event: ${ee(e)}`),
		  !0)
		: ri(e, t.ignoreErrors)
		? (S &&
				f.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${ee(e)}`),
		  !0)
		: di(e)
		? (S &&
				f.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${ee(e)}`),
		  !0)
		: si(e, t.ignoreTransactions)
		? (S &&
				f.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${ee(e)}`),
		  !0)
		: oi(e, t.denyUrls)
		? (S &&
				f.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${ee(e)}.
Url: ${ft(e)}`),
		  !0)
		: ii(e, t.allowUrls)
		? !1
		: (S &&
				f.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${ee(e)}.
Url: ${ft(e)}`),
		  !0);
}
function ri(e, t) {
	return e.type || !t || !t.length ? !1 : ai(e).some((n) => ce(n, t));
}
function si(e, t) {
	if (e.type !== 'transaction' || !t || !t.length) return !1;
	const n = e.transaction;
	return n ? ce(n, t) : !1;
}
function oi(e, t) {
	if (!t || !t.length) return !1;
	const n = ft(e);
	return n ? ce(n, t) : !1;
}
function ii(e, t) {
	if (!t || !t.length) return !0;
	const n = ft(e);
	return n ? ce(n, t) : !0;
}
function ai(e) {
	const t = [];
	e.message && t.push(e.message);
	let n;
	try {
		n = e.exception.values[e.exception.values.length - 1];
	} catch {}
	return (
		n &&
			n.value &&
			(t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`)),
		t
	);
}
function ci(e) {
	try {
		return e.exception.values[0].type === 'SentryError';
	} catch {}
	return !1;
}
function ui(e = []) {
	for (let t = e.length - 1; t >= 0; t--) {
		const n = e[t];
		if (n && n.filename !== '<anonymous>' && n.filename !== '[native code]')
			return n.filename || null;
	}
	return null;
}
function ft(e) {
	try {
		let t;
		try {
			t = e.exception.values[0].stacktrace.frames;
		} catch {}
		return t ? ui(t) : null;
	} catch {
		return S && f.error(`Cannot extract url for event ${ee(e)}`), null;
	}
}
function di(e) {
	return e.type ||
		!e.exception ||
		!e.exception.values ||
		e.exception.values.length === 0
		? !1
		: !e.message &&
				!e.exception.values.some(
					(t) => t.stacktrace || (t.type && t.type !== 'Error') || t.value,
				);
}
const li = 'Dedupe',
	fi = () => {
		let e;
		return {
			name: li,
			processEvent(t) {
				if (t.type) return t;
				try {
					if (mi(t, e))
						return (
							S &&
								f.warn(
									'Event dropped due to being a duplicate of previously captured event.',
								),
							null
						);
				} catch {}
				return (e = t);
			},
		};
	},
	pi = fi;
function mi(e, t) {
	return t ? !!(hi(e, t) || gi(e, t)) : !1;
}
function hi(e, t) {
	const n = e.message,
		r = t.message;
	return !(
		(!n && !r) ||
		(n && !r) ||
		(!n && r) ||
		n !== r ||
		!Fr(e, t) ||
		!xr(e, t)
	);
}
function gi(e, t) {
	const n = Un(t),
		r = Un(e);
	return !(
		!n ||
		!r ||
		n.type !== r.type ||
		n.value !== r.value ||
		!Fr(e, t) ||
		!xr(e, t)
	);
}
function xr(e, t) {
	let n = mn(e),
		r = mn(t);
	if (!n && !r) return !0;
	if ((n && !r) || (!n && r) || ((n = n), (r = r), r.length !== n.length))
		return !1;
	for (let s = 0; s < r.length; s++) {
		const o = r[s],
			i = n[s];
		if (
			o.filename !== i.filename ||
			o.lineno !== i.lineno ||
			o.colno !== i.colno ||
			o.function !== i.function
		)
			return !1;
	}
	return !0;
}
function Fr(e, t) {
	let n = e.fingerprint,
		r = t.fingerprint;
	if (!n && !r) return !0;
	if ((n && !r) || (!n && r)) return !1;
	(n = n), (r = r);
	try {
		return n.join('') === r.join('');
	} catch {
		return !1;
	}
}
function Un(e) {
	return e.exception && e.exception.values && e.exception.values[0];
}
const _i = 'ExtraErrorData',
	Ei = (e = {}) => {
		const { depth: t = 3, captureErrorCause: n = !0 } = e;
		return {
			name: _i,
			processEvent(r, s, o) {
				const { maxValueLength: i = 250 } = o.getOptions();
				return yi(r, s, t, n, i);
			},
		};
	},
	Si = Ei;
function yi(e, t = {}, n, r, s) {
	if (!t.originalException || !_e(t.originalException)) return e;
	const o = t.originalException.name || t.originalException.constructor.name,
		i = Ti(t.originalException, r, s);
	if (i) {
		const a = { ...e.contexts },
			c = sr(i, n);
		return (
			lt(c) && (de(c, '__sentry_skip_normalization__', !0), (a[o] = c)),
			{ ...e, contexts: a }
		);
	}
	return e;
}
function Ti(e, t, n) {
	try {
		const r = [
				'name',
				'message',
				'stack',
				'line',
				'column',
				'fileName',
				'lineNumber',
				'columnNumber',
				'toJSON',
			],
			s = {};
		for (const o of Object.keys(e)) {
			if (r.indexOf(o) !== -1) continue;
			const i = e[o];
			s[o] = _e(i) || typeof i == 'string' ? nr(`${i}`, n) : i;
		}
		if (
			(t &&
				e.cause !== void 0 &&
				(s.cause = _e(e.cause) ? e.cause.toString() : e.cause),
			typeof e.toJSON == 'function')
		) {
			const o = e.toJSON();
			for (const i of Object.keys(o)) {
				const a = o[i];
				s[i] = _e(a) ? a.toString() : a;
			}
		}
		return s;
	} catch (r) {
		S && f.error('Unable to extract extra data from the Error object:', r);
	}
	return null;
}
const vi = 'SessionTiming',
	bi = () => {
		const e = D() * 1e3;
		return {
			name: vi,
			processEvent(t) {
				const n = D() * 1e3;
				return {
					...t,
					extra: {
						...t.extra,
						'session:start': e,
						'session:duration': n - e,
						'session:end': n,
					},
				};
			},
		};
	},
	Ii = bi;
function ki(e, t, n, r, s = 'auto.http.browser') {
	if (!e.fetchData) return;
	const o = se() && t(e.fetchData.url);
	if (e.endTimestamp && o) {
		const p = e.fetchData.__span;
		if (!p) return;
		const _ = r[p];
		_ && (Ni(_, e), delete r[p]);
		return;
	}
	const i = C(),
		a = T(),
		{ method: c, url: u } = e.fetchData,
		l = Ri(u),
		d = l ? ue(l).host : void 0,
		m = !!L(),
		h =
			o && m
				? He({
						name: `${c} ${u}`,
						attributes: {
							url: u,
							type: 'fetch',
							'http.method': c,
							'http.url': l,
							'server.address': d,
							[A]: s,
							[Ee]: 'http.client',
						},
				  })
				: new ke();
	if (
		((e.fetchData.__span = h.spanContext().spanId),
		(r[h.spanContext().spanId] = h),
		n(e.fetchData.url) && a)
	) {
		const p = e.args[0];
		e.args[1] = e.args[1] || {};
		const _ = e.args[1];
		_.headers = wi(p, a, i, _, se() && m ? h : void 0);
	}
	return h;
}
function wi(e, t, n, r, s) {
	const o = be(),
		{
			traceId: i,
			spanId: a,
			sampled: c,
			dsc: u,
		} = { ...o.getPropagationContext(), ...n.getPropagationContext() },
		l = s ? ur(s) : dr(i, a, c),
		d = lr(u || (s ? ve(s) : zt(i, t))),
		m =
			r.headers ||
			(typeof Request < 'u' && xe(e, Request) ? e.headers : void 0);
	if (m)
		if (typeof Headers < 'u' && xe(m, Headers)) {
			const h = new Headers(m);
			if ((h.set('sentry-trace', l), d)) {
				const p = h.get(ge);
				if (p) {
					const _ = Qe(p);
					h.set(ge, _ ? `${_},${d}` : d);
				} else h.set(ge, d);
			}
			return h;
		} else if (Array.isArray(m)) {
			const h = [
				...m
					.filter((p) => !(Array.isArray(p) && p[0] === 'sentry-trace'))
					.map((p) => {
						if (Array.isArray(p) && p[0] === ge && typeof p[1] == 'string') {
							const [_, G, ...B] = p;
							return [_, Qe(G), ...B];
						} else return p;
					}),
				['sentry-trace', l],
			];
			return d && h.push([ge, d]), h;
		} else {
			const h = 'baggage' in m ? m.baggage : void 0;
			let p = [];
			return (
				Array.isArray(h)
					? (p = h
							.map((_) => (typeof _ == 'string' ? Qe(_) : _))
							.filter((_) => _ === ''))
					: h && p.push(Qe(h)),
				d && p.push(d),
				{
					...m,
					'sentry-trace': l,
					baggage: p.length > 0 ? p.join(',') : void 0,
				}
			);
		}
	else return { 'sentry-trace': l, baggage: d };
}
function Ri(e) {
	try {
		return new URL(e).href;
	} catch {
		return;
	}
}
function Ni(e, t) {
	if (t.response) {
		fr(e, t.response.status);
		const n =
			t.response &&
			t.response.headers &&
			t.response.headers.get('content-length');
		if (n) {
			const r = parseInt(n);
			r > 0 && e.setAttribute('http.response_content_length', r);
		}
	} else t.error && e.setStatus({ code: Fe, message: 'internal_error' });
	e.end();
}
function Qe(e) {
	return e
		.split(',')
		.filter((t) => !t.split('=')[0].startsWith(gs))
		.join(',');
}
const E = I;
let $t = 0;
function Lr() {
	return $t > 0;
}
function Ai() {
	$t++,
		setTimeout(() => {
			$t--;
		});
}
function Te(e, t = {}, n) {
	if (typeof e != 'function') return e;
	try {
		const s = e.__sentry_wrapped__;
		if (s) return typeof s == 'function' ? s : e;
		if (Kt(e)) return e;
	} catch {
		return e;
	}
	const r = function () {
		const s = Array.prototype.slice.call(arguments);
		try {
			const o = s.map((i) => Te(i, t));
			return e.apply(this, o);
		} catch (o) {
			throw (
				(Ai(),
				Wt((i) => {
					i.addEventProcessor(
						(a) => (
							t.mechanism && (Ct(a, void 0), Le(a, t.mechanism)),
							(a.extra = { ...a.extra, arguments: s }),
							a
						),
					),
						Es(o);
				}),
				o)
			);
		}
	};
	try {
		for (const s in e)
			Object.prototype.hasOwnProperty.call(e, s) && (r[s] = e[s]);
	} catch {}
	_s(r, e), de(e, '__sentry_wrapped__', r);
	try {
		Object.getOwnPropertyDescriptor(r, 'name').configurable &&
			Object.defineProperty(r, 'name', {
				get() {
					return e.name;
				},
			});
	} catch {}
	return r;
}
const F = typeof __SENTRY_DEBUG__ > 'u' || __SENTRY_DEBUG__;
function Qt(e, t) {
	const n = en(e, t),
		r = { type: Fi(t), value: Li(t) };
	return (
		n.length && (r.stacktrace = { frames: n }),
		r.type === void 0 &&
			r.value === '' &&
			(r.value = 'Unrecoverable error caught'),
		r
	);
}
function Ci(e, t, n, r) {
	const s = T(),
		o = s && s.getOptions().normalizeDepth,
		i = Ui(t),
		a = { __serialized__: ys(t, o) };
	if (i) return { exception: { values: [Qt(e, i)] }, extra: a };
	const c = {
		exception: {
			values: [
				{
					type: Vt(t) ? t.constructor.name : r ? 'UnhandledRejection' : 'Error',
					value: Mi(t, { isUnhandledRejection: r }),
				},
			],
		},
		extra: a,
	};
	if (n) {
		const u = en(e, n);
		u.length && (c.exception.values[0].stacktrace = { frames: u });
	}
	return c;
}
function vt(e, t) {
	return { exception: { values: [Qt(e, t)] } };
}
function en(e, t) {
	const n = t.stacktrace || t.stack || '',
		r = Oi(t),
		s = xi(t);
	try {
		return e(n, r, s);
	} catch {}
	return [];
}
const Pi = /Minified React error #\d+;/i;
function Oi(e) {
	return e && Pi.test(e.message) ? 1 : 0;
}
function xi(e) {
	return typeof e.framesToPop == 'number' ? e.framesToPop : 0;
}
function Dr(e) {
	return typeof WebAssembly < 'u' && typeof WebAssembly.Exception < 'u'
		? e instanceof WebAssembly.Exception
		: !1;
}
function Fi(e) {
	const t = e && e.name;
	return !t && Dr(e)
		? e.message && Array.isArray(e.message) && e.message.length == 2
			? e.message[0]
			: 'WebAssembly.Exception'
		: t;
}
function Li(e) {
	const t = e && e.message;
	return t
		? t.error && typeof t.error.message == 'string'
			? t.error.message
			: Dr(e) && Array.isArray(e.message) && e.message.length == 2
			? e.message[1]
			: t
		: 'No error message';
}
function Di(e, t, n, r) {
	const s = (n && n.syntheticException) || void 0,
		o = tn(e, t, s, r);
	return (
		Le(o),
		(o.level = 'error'),
		n && n.event_id && (o.event_id = n.event_id),
		le(o)
	);
}
function $i(e, t, n = 'info', r, s) {
	const o = (r && r.syntheticException) || void 0,
		i = Mt(e, t, o, s);
	return (i.level = n), r && r.event_id && (i.event_id = r.event_id), le(i);
}
function tn(e, t, n, r, s) {
	let o;
	if (pr(t) && t.error) return vt(e, t.error);
	if (hn(t) || Ss(t)) {
		const i = t;
		if ('stack' in t) o = vt(e, t);
		else {
			const a = i.name || (hn(i) ? 'DOMError' : 'DOMException'),
				c = i.message ? `${a}: ${i.message}` : a;
			(o = Mt(e, c, n, r)), Ct(o, c);
		}
		return (
			'code' in i && (o.tags = { ...o.tags, 'DOMException.code': `${i.code}` }),
			o
		);
	}
	return _e(t)
		? vt(e, t)
		: lt(t) || Vt(t)
		? ((o = Ci(e, t, n, s)), Le(o, { synthetic: !0 }), o)
		: ((o = Mt(e, t, n, r)), Ct(o, `${t}`), Le(o, { synthetic: !0 }), o);
}
function Mt(e, t, n, r) {
	const s = {};
	if (r && n) {
		const o = en(e, n);
		o.length &&
			(s.exception = { values: [{ value: t, stacktrace: { frames: o } }] });
	}
	if (cr(t)) {
		const { __sentry_template_string__: o, __sentry_template_values__: i } = t;
		return (s.logentry = { message: o, params: i }), s;
	}
	return (s.message = t), s;
}
function Mi(e, { isUnhandledRejection: t }) {
	const n = Ts(e),
		r = t ? 'promise rejection' : 'exception';
	return pr(e)
		? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\``
		: Vt(e)
		? `Event \`${Hi(e)}\` (type=${e.type}) captured as ${r}`
		: `Object captured as ${r} with keys: ${n}`;
}
function Hi(e) {
	try {
		const t = Object.getPrototypeOf(e);
		return t ? t.constructor.name : void 0;
	} catch {}
}
function Ui(e) {
	for (const t in e)
		if (Object.prototype.hasOwnProperty.call(e, t)) {
			const n = e[t];
			if (n instanceof Error) return n;
		}
}
function Bi(e, { metadata: t, tunnel: n, dsn: r }) {
	const s = {
			event_id: e.event_id,
			sent_at: new Date().toISOString(),
			...(t && t.sdk && { sdk: { name: t.sdk.name, version: t.sdk.version } }),
			...(!!n && !!r && { dsn: Me(r) }),
		},
		o = qi(e);
	return Ie(s, [o]);
}
function qi(e) {
	return [{ type: 'user_report' }, e];
}
class ji extends Do {
	constructor(t) {
		const n = { parentSpanIsAlwaysRootSpan: !0, ...t },
			r = E.SENTRY_SDK_SOURCE || qs();
		Yo(n, 'browser', ['browser'], r),
			super(n),
			n.sendClientReports &&
				E.document &&
				E.document.addEventListener('visibilitychange', () => {
					E.document.visibilityState === 'hidden' && this._flushOutcomes();
				});
	}
	eventFromException(t, n) {
		return Di(this._options.stackParser, t, n, this._options.attachStacktrace);
	}
	eventFromMessage(t, n = 'info', r) {
		return $i(
			this._options.stackParser,
			t,
			n,
			r,
			this._options.attachStacktrace,
		);
	}
	captureUserFeedback(t) {
		if (!this._isEnabled()) {
			F && f.warn('SDK not enabled, will not capture user feedback.');
			return;
		}
		const n = Bi(t, {
			metadata: this.getSdkMetadata(),
			dsn: this.getDsn(),
			tunnel: this.getOptions().tunnel,
		});
		this.sendEnvelope(n);
	}
	_prepareEvent(t, n, r) {
		return (
			(t.platform = t.platform || 'javascript'), super._prepareEvent(t, n, r)
		);
	}
}
const U = typeof __SENTRY_DEBUG__ > 'u' || __SENTRY_DEBUG__,
	Gi = (e, t) => (e > t[1] ? 'poor' : e > t[0] ? 'needs-improvement' : 'good'),
	we = (e, t, n, r) => {
		let s, o;
		return (i) => {
			t.value >= 0 &&
				(i || r) &&
				((o = t.value - (s || 0)),
				(o || s === void 0) &&
					((s = t.value), (t.delta = o), (t.rating = Gi(t.value, n)), e(t)));
		};
	},
	g = I,
	Wi = () =>
		`v3-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`,
	Ue = () =>
		g.performance &&
		performance.getEntriesByType &&
		performance.getEntriesByType('navigation')[0],
	Be = () => {
		const e = Ue();
		return (e && e.activationStart) || 0;
	},
	Re = (e, t) => {
		const n = Ue();
		let r = 'navigate';
		return (
			n &&
				((g.document && g.document.prerendering) || Be() > 0
					? (r = 'prerender')
					: g.document && g.document.wasDiscarded
					? (r = 'restore')
					: n.type && (r = n.type.replace(/_/g, '-'))),
			{
				name: e,
				value: typeof t > 'u' ? -1 : t,
				rating: 'good',
				delta: 0,
				entries: [],
				id: Wi(),
				navigationType: r,
			}
		);
	},
	me = (e, t, n) => {
		try {
			if (PerformanceObserver.supportedEntryTypes.includes(e)) {
				const r = new PerformanceObserver((s) => {
					Promise.resolve().then(() => {
						t(s.getEntries());
					});
				});
				return r.observe(Object.assign({ type: e, buffered: !0 }, n || {})), r;
			}
		} catch {}
	},
	qe = (e) => {
		const t = (n) => {
			(n.type === 'pagehide' ||
				(g.document && g.document.visibilityState === 'hidden')) &&
				e(n);
		};
		g.document &&
			(addEventListener('visibilitychange', t, !0),
			addEventListener('pagehide', t, !0));
	},
	nn = (e) => {
		let t = !1;
		return (n) => {
			t || (e(n), (t = !0));
		};
	};
let De = -1;
const Yi = () => {
		De =
			g.document.visibilityState === 'hidden' && !g.document.prerendering
				? 0
				: 1 / 0;
	},
	pt = (e) => {
		g.document.visibilityState === 'hidden' &&
			De > -1 &&
			((De = e.type === 'visibilitychange' ? e.timeStamp : 0),
			removeEventListener('visibilitychange', pt, !0),
			removeEventListener('prerenderingchange', pt, !0));
	},
	Xi = () => {
		addEventListener('visibilitychange', pt, !0),
			addEventListener('prerenderingchange', pt, !0);
	},
	Tt = () => (
		g.document && De < 0 && (Yi(), Xi()),
		{
			get firstHiddenTime() {
				return De;
			},
		}
	),
	je = (e) => {
		g.document && g.document.prerendering
			? addEventListener('prerenderingchange', () => e(), !0)
			: e();
	},
	zi = [1800, 3e3],
	Ki = (e, t = {}) => {
		je(() => {
			const n = Tt(),
				r = Re('FCP');
			let s;
			const i = me('paint', (a) => {
				a.forEach((c) => {
					c.name === 'first-contentful-paint' &&
						(i.disconnect(),
						c.startTime < n.firstHiddenTime &&
							((r.value = Math.max(c.startTime - Be(), 0)),
							r.entries.push(c),
							s(!0)));
				});
			});
			i && (s = we(e, r, zi, t.reportAllChanges));
		});
	},
	Vi = [0.1, 0.25],
	Ji = (e, t = {}) => {
		Ki(
			nn(() => {
				const n = Re('CLS', 0);
				let r,
					s = 0,
					o = [];
				const i = (c) => {
						c.forEach((u) => {
							if (!u.hadRecentInput) {
								const l = o[0],
									d = o[o.length - 1];
								s &&
								l &&
								d &&
								u.startTime - d.startTime < 1e3 &&
								u.startTime - l.startTime < 5e3
									? ((s += u.value), o.push(u))
									: ((s = u.value), (o = [u]));
							}
						}),
							s > n.value && ((n.value = s), (n.entries = o), r());
					},
					a = me('layout-shift', i);
				a &&
					((r = we(e, n, Vi, t.reportAllChanges)),
					qe(() => {
						i(a.takeRecords()), r(!0);
					}),
					setTimeout(r, 0));
			}),
		);
	},
	Zi = [100, 300],
	Qi = (e, t = {}) => {
		je(() => {
			const n = Tt(),
				r = Re('FID');
			let s;
			const o = (c) => {
					c.startTime < n.firstHiddenTime &&
						((r.value = c.processingStart - c.startTime),
						r.entries.push(c),
						s(!0));
				},
				i = (c) => {
					c.forEach(o);
				},
				a = me('first-input', i);
			(s = we(e, r, Zi, t.reportAllChanges)),
				a &&
					qe(
						nn(() => {
							i(a.takeRecords()), a.disconnect();
						}),
					);
		});
	};
let $r = 0,
	bt = 1 / 0,
	et = 0;
const ea = (e) => {
	e.forEach((t) => {
		t.interactionId &&
			((bt = Math.min(bt, t.interactionId)),
			(et = Math.max(et, t.interactionId)),
			($r = et ? (et - bt) / 7 + 1 : 0));
	});
};
let Ht;
const ta = () => (Ht ? $r : performance.interactionCount || 0),
	na = () => {
		'interactionCount' in performance ||
			Ht ||
			(Ht = me('event', ea, {
				type: 'event',
				buffered: !0,
				durationThreshold: 0,
			}));
	},
	ra = [200, 500],
	sa = 0,
	Mr = () => ta() - sa,
	Bn = 10,
	z = [],
	It = {},
	qn = (e) => {
		const t = z[z.length - 1],
			n = It[e.interactionId];
		if (n || z.length < Bn || (t && e.duration > t.latency)) {
			if (n) n.entries.push(e), (n.latency = Math.max(n.latency, e.duration));
			else {
				const r = { id: e.interactionId, latency: e.duration, entries: [e] };
				(It[r.id] = r), z.push(r);
			}
			z.sort((r, s) => s.latency - r.latency),
				z.splice(Bn).forEach((r) => {
					delete It[r.id];
				});
		}
	},
	oa = () => {
		const e = Math.min(z.length - 1, Math.floor(Mr() / 50));
		return z[e];
	},
	ia = (e, t = {}) => {
		je(() => {
			na();
			const n = Re('INP');
			let r;
			const s = (i) => {
					i.forEach((c) => {
						c.interactionId && qn(c),
							c.entryType === 'first-input' &&
								!z.some((l) =>
									l.entries.some(
										(d) =>
											c.duration === d.duration && c.startTime === d.startTime,
									),
								) &&
								qn(c);
					});
					const a = oa();
					a &&
						a.latency !== n.value &&
						((n.value = a.latency), (n.entries = a.entries), r());
				},
				o = me('event', s, {
					durationThreshold:
						t.durationThreshold != null ? t.durationThreshold : 40,
				});
			(r = we(e, n, ra, t.reportAllChanges)),
				o &&
					('PerformanceEventTiming' in g &&
						'interactionId' in PerformanceEventTiming.prototype &&
						o.observe({ type: 'first-input', buffered: !0 }),
					qe(() => {
						s(o.takeRecords()),
							n.value < 0 && Mr() > 0 && ((n.value = 0), (n.entries = [])),
							r(!0);
					}));
		});
	},
	aa = [2500, 4e3],
	jn = {},
	ca = (e, t = {}) => {
		je(() => {
			const n = Tt(),
				r = Re('LCP');
			let s;
			const o = (a) => {
					const c = a[a.length - 1];
					c &&
						c.startTime < n.firstHiddenTime &&
						((r.value = Math.max(c.startTime - Be(), 0)),
						(r.entries = [c]),
						s());
				},
				i = me('largest-contentful-paint', o);
			if (i) {
				s = we(e, r, aa, t.reportAllChanges);
				const a = nn(() => {
					jn[r.id] ||
						(o(i.takeRecords()), i.disconnect(), (jn[r.id] = !0), s(!0));
				});
				['keydown', 'click'].forEach((c) => {
					g.document && addEventListener(c, () => setTimeout(a, 0), !0);
				}),
					qe(a);
			}
		});
	},
	ua = [800, 1800],
	Ut = (e) => {
		g.document && g.document.prerendering
			? je(() => Ut(e))
			: g.document && g.document.readyState !== 'complete'
			? addEventListener('load', () => Ut(e), !0)
			: setTimeout(e, 0);
	},
	da = (e, t = {}) => {
		const n = Re('TTFB'),
			r = we(e, n, ua, t.reportAllChanges);
		Ut(() => {
			const s = Ue();
			if (s) {
				const o = s.responseStart;
				if (o <= 0 || o > performance.now()) return;
				(n.value = Math.max(o - Be(), 0)), (n.entries = [s]), r(!0);
			}
		});
	},
	Pe = {},
	mt = {};
let Hr, Ur, Br, qr, jr;
function Gr(e, t = !1) {
	return Ge('cls', e, ha, Hr, t);
}
function la(e, t = !1) {
	return Ge('lcp', e, _a, Br, t);
}
function fa(e) {
	return Ge('fid', e, ga, Ur);
}
function pa(e) {
	return Ge('ttfb', e, Ea, qr);
}
function ma(e) {
	return Ge('inp', e, Sa, jr);
}
function $e(e, t) {
	return Wr(e, t), mt[e] || (ya(e), (mt[e] = !0)), Yr(e, t);
}
function Ne(e, t) {
	const n = Pe[e];
	if (!(!n || !n.length))
		for (const r of n)
			try {
				r(t);
			} catch (s) {
				U &&
					f.error(
						`Error while triggering instrumentation handler.
Type: ${e}
Name: ${re(r)}
Error:`,
						s,
					);
			}
}
function ha() {
	return Ji(
		(e) => {
			Ne('cls', { metric: e }), (Hr = e);
		},
		{ reportAllChanges: !0 },
	);
}
function ga() {
	return Qi((e) => {
		Ne('fid', { metric: e }), (Ur = e);
	});
}
function _a() {
	return ca(
		(e) => {
			Ne('lcp', { metric: e }), (Br = e);
		},
		{ reportAllChanges: !0 },
	);
}
function Ea() {
	return da((e) => {
		Ne('ttfb', { metric: e }), (qr = e);
	});
}
function Sa() {
	return ia((e) => {
		Ne('inp', { metric: e }), (jr = e);
	});
}
function Ge(e, t, n, r, s = !1) {
	Wr(e, t);
	let o;
	return (
		mt[e] || ((o = n()), (mt[e] = !0)),
		r && t({ metric: r }),
		Yr(e, t, s ? o : void 0)
	);
}
function ya(e) {
	const t = {};
	e === 'event' && (t.durationThreshold = 0),
		me(
			e,
			(n) => {
				Ne(e, { entries: n });
			},
			t,
		);
}
function Wr(e, t) {
	(Pe[e] = Pe[e] || []), Pe[e].push(t);
}
function Yr(e, t, n) {
	return () => {
		n && n();
		const r = Pe[e];
		if (!r) return;
		const s = r.indexOf(t);
		s !== -1 && r.splice(s, 1);
	};
}
function Ta(e) {
	return 'duration' in e;
}
function kt(e) {
	return typeof e == 'number' && isFinite(e);
}
function V(e, t, n, { ...r }) {
	const s = v(e).start_timestamp;
	return (
		s &&
			s > t &&
			typeof e.updateStartTime == 'function' &&
			e.updateStartTime(t),
		Rr(e, () => {
			const o = He({ startTime: t, ...r });
			return o && o.end(n), o;
		})
	);
}
function Xr(e) {
	const t = T();
	if (!t) return;
	const { name: n, transaction: r, attributes: s, startTime: o } = e,
		{ release: i, environment: a } = t.getOptions(),
		c = t.getIntegrationByName('Replay'),
		u = c && c.getReplayId(),
		l = C(),
		d = l.getUser(),
		m = d !== void 0 ? d.email || d.id || d.ip_address : void 0;
	let h;
	try {
		h = l.getScopeData().contexts.profile.profile_id;
	} catch {}
	const p = {
		release: i,
		environment: a,
		user: m || void 0,
		profile_id: h || void 0,
		replay_id: u || void 0,
		transaction: r,
		'user_agent.original': g.navigator && g.navigator.userAgent,
		...s,
	};
	return He({
		name: n,
		attributes: p,
		startTime: o,
		experimental: { standalone: !0 },
	});
}
function rn() {
	return g && g.addEventListener && g.performance;
}
function k(e) {
	return e / 1e3;
}
function va() {
	let e = 0,
		t,
		n;
	if (!Ia()) return;
	let r = !1;
	function s() {
		r || ((r = !0), n && ba(e, t, n), o());
	}
	const o = Gr(({ metric: i }) => {
		const a = i.entries[i.entries.length - 1];
		a && ((e = i.value), (t = a));
	}, !0);
	qe(() => {
		s();
	}),
		setTimeout(() => {
			const i = T(),
				a = K([
					i,
					'optionalAccess',
					(d) => d.on,
					'call',
					(d) =>
						d('startNavigationSpan', () => {
							s(), a && a();
						}),
				]),
				c = L(),
				u = c && $(c),
				l = u && v(u);
			l && l.op === 'pageload' && (n = u.spanContext().spanId);
		}, 0);
}
function ba(e, t, n) {
	U && f.log(`Sending CLS span (${e})`);
	const r = k((M || 0) + (K([t, 'optionalAccess', (c) => c.startTime]) || 0)),
		s = C().getScopeData().transactionName,
		o = t
			? Se(
					K([
						t,
						'access',
						(c) => c.sources,
						'access',
						(c) => c[0],
						'optionalAccess',
						(c) => c.node,
					]),
			  )
			: 'Layout shift',
		i = fe({
			[A]: 'auto.http.browser.cls',
			[Ee]: 'ui.webvital.cls',
			[Gt]: K([t, 'optionalAccess', (c) => c.duration]) || 0,
			'sentry.pageload.span_id': n,
		}),
		a = Xr({ name: o, transaction: s, attributes: i, startTime: r });
	K([
		a,
		'optionalAccess',
		(c) => c.addEvent,
		'call',
		(c) => c('cls', { [St]: '', [Et]: e }),
	]),
		K([a, 'optionalAccess', (c) => c.end, 'call', (c) => c(r)]);
}
function Ia() {
	try {
		return K([
			PerformanceObserver,
			'access',
			(e) => e.supportedEntryTypes,
			'optionalAccess',
			(e) => e.includes,
			'call',
			(e) => e('layout-shift'),
		]);
	} catch {
		return !1;
	}
}
const ka = 2147483647;
let Gn = 0,
	N = {},
	Y,
	Oe;
function wa({ recordClsStandaloneSpans: e }) {
	const t = rn();
	if (t && M) {
		t.mark && g.performance.mark('sentry-tracing-init');
		const n = Oa(),
			r = Pa(),
			s = xa(),
			o = e ? va() : Ca();
		return () => {
			n(), r(), s(), o && o();
		};
	}
	return () => {};
}
function Ra() {
	$e('longtask', ({ entries: e }) => {
		const t = L();
		if (!t) return;
		const { op: n, start_timestamp: r } = v(t);
		for (const s of e) {
			const o = k(M + s.startTime),
				i = k(s.duration);
			(n === 'navigation' && r && o < r) ||
				V(t, o, o + i, {
					name: 'Main UI thread blocked',
					op: 'ui.long-task',
					attributes: { [A]: 'auto.ui.browser.metrics' },
				});
		}
	});
}
function Na() {
	new PerformanceObserver((t) => {
		const n = L();
		if (n)
			for (const r of t.getEntries()) {
				if (!r.scripts[0]) continue;
				const s = k(M + r.startTime),
					{ start_timestamp: o, op: i } = v(n);
				if (i === 'navigation' && o && s < o) continue;
				const a = k(r.duration),
					c = { [A]: 'auto.ui.browser.metrics' },
					u = r.scripts[0],
					{
						invoker: l,
						invokerType: d,
						sourceURL: m,
						sourceFunctionName: h,
						sourceCharPosition: p,
					} = u;
				(c['browser.script.invoker'] = l),
					(c['browser.script.invoker_type'] = d),
					m && (c['code.filepath'] = m),
					h && (c['code.function'] = h),
					p !== -1 && (c['browser.script.source_char_position'] = p),
					V(n, s, s + a, {
						name: 'Main UI thread blocked',
						op: 'ui.long-animation-frame',
						attributes: c,
					});
			}
	}).observe({ type: 'long-animation-frame', buffered: !0 });
}
function Aa() {
	$e('event', ({ entries: e }) => {
		const t = L();
		if (t) {
			for (const n of e)
				if (n.name === 'click') {
					const r = k(M + n.startTime),
						s = k(n.duration),
						o = {
							name: Se(n.target),
							op: `ui.interaction.${n.name}`,
							startTime: r,
							attributes: { [A]: 'auto.ui.browser.metrics' },
						},
						i = mr(n.target);
					i && (o.attributes['ui.component_name'] = i), V(t, r, r + s, o);
				}
		}
	});
}
function Ca() {
	return Gr(({ metric: e }) => {
		const t = e.entries[e.entries.length - 1];
		t &&
			(U && f.log(`[Measurements] Adding CLS ${e.value}`),
			(N.cls = { value: e.value, unit: '' }),
			(Oe = t));
	}, !0);
}
function Pa() {
	return la(({ metric: e }) => {
		const t = e.entries[e.entries.length - 1];
		t &&
			(U && f.log('[Measurements] Adding LCP'),
			(N.lcp = { value: e.value, unit: 'millisecond' }),
			(Y = t));
	}, !0);
}
function Oa() {
	return fa(({ metric: e }) => {
		const t = e.entries[e.entries.length - 1];
		if (!t) return;
		const n = k(M),
			r = k(t.startTime);
		U && f.log('[Measurements] Adding FID'),
			(N.fid = { value: e.value, unit: 'millisecond' }),
			(N['mark.fid'] = { value: n + r, unit: 'second' });
	});
}
function xa() {
	return pa(({ metric: e }) => {
		e.entries[e.entries.length - 1] &&
			(U && f.log('[Measurements] Adding TTFB'),
			(N.ttfb = { value: e.value, unit: 'millisecond' }));
	});
}
function Fa(e, t) {
	const n = rn();
	if (!n || !g.performance.getEntries || !M) return;
	U && f.log('[Tracing] Adding & adjusting spans using Performance API');
	const r = k(M),
		s = n.getEntries(),
		{ op: o, start_timestamp: i } = v(e);
	if (
		(s.slice(Gn).forEach((a) => {
			const c = k(a.startTime),
				u = k(Math.max(0, a.duration));
			if (!(o === 'navigation' && i && r + c < i))
				switch (a.entryType) {
					case 'navigation': {
						Da(e, a, r);
						break;
					}
					case 'mark':
					case 'paint':
					case 'measure': {
						La(e, a, c, u, r);
						const l = Tt(),
							d = a.startTime < l.firstHiddenTime;
						a.name === 'first-paint' &&
							d &&
							(U && f.log('[Measurements] Adding FP'),
							(N.fp = { value: a.startTime, unit: 'millisecond' })),
							a.name === 'first-contentful-paint' &&
								d &&
								(U && f.log('[Measurements] Adding FCP'),
								(N.fcp = { value: a.startTime, unit: 'millisecond' }));
						break;
					}
					case 'resource': {
						Ma(e, a, a.name, c, u, r);
						break;
					}
				}
		}),
		(Gn = Math.max(s.length - 1, 0)),
		Ha(e),
		o === 'pageload')
	) {
		Ba(N);
		const a = N['mark.fid'];
		a &&
			N.fid &&
			(V(e, a.value, a.value + k(N.fid.value), {
				name: 'first input delay',
				op: 'ui.action',
				attributes: { [A]: 'auto.ui.browser.metrics' },
			}),
			delete N['mark.fid']),
			(!('fcp' in N) || !t.recordClsOnPageloadSpan) && delete N.cls,
			Object.entries(N).forEach(([c, u]) => {
				go(c, u.value, u.unit);
			}),
			e.setAttribute('performance.timeOrigin', r),
			e.setAttribute('performance.activationStart', Be()),
			Ua(e);
	}
	(Y = void 0), (Oe = void 0), (N = {});
}
function La(e, t, n, r, s) {
	const o = Ue(),
		i = k(o ? o.requestStart : 0),
		a = s + Math.max(n, i),
		c = s + n,
		u = c + r,
		l = { [A]: 'auto.resource.browser.metrics' };
	return (
		a !== c &&
			((l['sentry.browser.measure_happened_before_request'] = !0),
			(l['sentry.browser.measure_start_time'] = a)),
		V(e, a, u, { name: t.name, op: t.entryType, attributes: l }),
		a
	);
}
function Da(e, t, n) {
	[
		'unloadEvent',
		'redirect',
		'domContentLoadedEvent',
		'loadEvent',
		'connect',
	].forEach((r) => {
		tt(e, t, r, n);
	}),
		tt(e, t, 'secureConnection', n, 'TLS/SSL', 'connectEnd'),
		tt(e, t, 'fetch', n, 'cache', 'domainLookupStart'),
		tt(e, t, 'domainLookup', n, 'DNS'),
		$a(e, t, n);
}
function tt(e, t, n, r, s, o) {
	const i = o ? t[o] : t[`${n}End`],
		a = t[`${n}Start`];
	!a ||
		!i ||
		V(e, r + k(a), r + k(i), {
			op: `browser.${s || n}`,
			name: t.name,
			attributes: { [A]: 'auto.ui.browser.metrics' },
		});
}
function $a(e, t, n) {
	const r = n + k(t.requestStart),
		s = n + k(t.responseEnd),
		o = n + k(t.responseStart);
	t.responseEnd &&
		(V(e, r, s, {
			op: 'browser.request',
			name: t.name,
			attributes: { [A]: 'auto.ui.browser.metrics' },
		}),
		V(e, o, s, {
			op: 'browser.response',
			name: t.name,
			attributes: { [A]: 'auto.ui.browser.metrics' },
		}));
}
function Ma(e, t, n, r, s, o) {
	if (t.initiatorType === 'xmlhttprequest' || t.initiatorType === 'fetch')
		return;
	const i = ue(n),
		a = { [A]: 'auto.resource.browser.metrics' };
	wt(a, t, 'transferSize', 'http.response_transfer_size'),
		wt(a, t, 'encodedBodySize', 'http.response_content_length'),
		wt(a, t, 'decodedBodySize', 'http.decoded_response_content_length'),
		t.deliveryType != null &&
			(a['http.response_delivery_type'] = t.deliveryType),
		'renderBlockingStatus' in t &&
			(a['resource.render_blocking_status'] = t.renderBlockingStatus),
		i.protocol && (a['url.scheme'] = i.protocol.split(':').pop()),
		i.host && (a['server.address'] = i.host),
		(a['url.same_origin'] = n.includes(g.location.origin));
	const c = o + r,
		u = c + s;
	V(e, c, u, {
		name: n.replace(g.location.origin, ''),
		op: t.initiatorType ? `resource.${t.initiatorType}` : 'resource.other',
		attributes: a,
	});
}
function Ha(e) {
	const t = g.navigator;
	if (!t) return;
	const n = t.connection;
	n &&
		(n.effectiveType &&
			e.setAttribute('effectiveConnectionType', n.effectiveType),
		n.type && e.setAttribute('connectionType', n.type),
		kt(n.rtt) && (N['connection.rtt'] = { value: n.rtt, unit: 'millisecond' })),
		kt(t.deviceMemory) &&
			e.setAttribute('deviceMemory', `${t.deviceMemory} GB`),
		kt(t.hardwareConcurrency) &&
			e.setAttribute('hardwareConcurrency', String(t.hardwareConcurrency));
}
function Ua(e) {
	Y &&
		(U && f.log('[Measurements] Adding LCP Data'),
		Y.element && e.setAttribute('lcp.element', Se(Y.element)),
		Y.id && e.setAttribute('lcp.id', Y.id),
		Y.url && e.setAttribute('lcp.url', Y.url.trim().slice(0, 200)),
		e.setAttribute('lcp.size', Y.size)),
		Oe &&
			Oe.sources &&
			(U && f.log('[Measurements] Adding CLS Data'),
			Oe.sources.forEach((t, n) =>
				e.setAttribute(`cls.source.${n + 1}`, Se(t.node)),
			));
}
function wt(e, t, n, r) {
	const s = t[n];
	s != null && s < ka && (e[r] = s);
}
function Ba(e) {
	const t = Ue();
	if (!t) return;
	const { responseStart: n, requestStart: r } = t;
	r <= n &&
		(U && f.log('[Measurements] Adding TTFB Request Time'),
		(e['ttfb.requestTime'] = { value: n - r, unit: 'millisecond' }));
}
const qa = 1e3;
let Wn, Bt, qt;
function ja(e) {
	const t = 'dom';
	oe(t, e), ie(t, Ga);
}
function Ga() {
	if (!g.document) return;
	const e = j.bind(null, 'dom'),
		t = Yn(e, !0);
	g.document.addEventListener('click', t, !1),
		g.document.addEventListener('keypress', t, !1),
		['EventTarget', 'Node'].forEach((n) => {
			const r = g[n] && g[n].prototype;
			!r ||
				!r.hasOwnProperty ||
				!r.hasOwnProperty('addEventListener') ||
				(H(r, 'addEventListener', function (s) {
					return function (o, i, a) {
						if (o === 'click' || o == 'keypress')
							try {
								const c = this,
									u = (c.__sentry_instrumentation_handlers__ =
										c.__sentry_instrumentation_handlers__ || {}),
									l = (u[o] = u[o] || { refCount: 0 });
								if (!l.handler) {
									const d = Yn(e);
									(l.handler = d), s.call(this, o, d, a);
								}
								l.refCount++;
							} catch {}
						return s.call(this, o, i, a);
					};
				}),
				H(r, 'removeEventListener', function (s) {
					return function (o, i, a) {
						if (o === 'click' || o == 'keypress')
							try {
								const c = this,
									u = c.__sentry_instrumentation_handlers__ || {},
									l = u[o];
								l &&
									(l.refCount--,
									l.refCount <= 0 &&
										(s.call(this, o, l.handler, a),
										(l.handler = void 0),
										delete u[o]),
									Object.keys(u).length === 0 &&
										delete c.__sentry_instrumentation_handlers__);
							} catch {}
						return s.call(this, o, i, a);
					};
				}));
		});
}
function Wa(e) {
	if (e.type !== Bt) return !1;
	try {
		if (!e.target || e.target._sentryId !== qt) return !1;
	} catch {}
	return !0;
}
function Ya(e, t) {
	return e !== 'keypress'
		? !1
		: !t || !t.tagName
		? !0
		: !(
				t.tagName === 'INPUT' ||
				t.tagName === 'TEXTAREA' ||
				t.isContentEditable
		  );
}
function Yn(e, t = !1) {
	return (n) => {
		if (!n || n._sentryCaptured) return;
		const r = Xa(n);
		if (Ya(n.type, r)) return;
		de(n, '_sentryCaptured', !0), r && !r._sentryId && de(r, '_sentryId', ne());
		const s = n.type === 'keypress' ? 'input' : n.type;
		Wa(n) ||
			(e({ event: n, name: s, global: t }),
			(Bt = n.type),
			(qt = r ? r._sentryId : void 0)),
			clearTimeout(Wn),
			(Wn = g.setTimeout(() => {
				(qt = void 0), (Bt = void 0);
			}, qa));
	};
}
function Xa(e) {
	try {
		return e.target;
	} catch {
		return null;
	}
}
let nt;
function sn(e) {
	const t = 'history';
	oe(t, e), ie(t, za);
}
function za() {
	if (!oo()) return;
	const e = g.onpopstate;
	g.onpopstate = function (...n) {
		const r = g.location.href,
			s = nt;
		if (((nt = r), j('history', { from: s, to: r }), e))
			try {
				return e.apply(this, n);
			} catch {}
	};
	function t(n) {
		return function (...r) {
			const s = r.length > 2 ? r[2] : void 0;
			if (s) {
				const o = nt,
					i = String(s);
				(nt = i), j('history', { from: o, to: i });
			}
			return n.apply(this, r);
		};
	}
	H(g.history, 'pushState', t), H(g.history, 'replaceState', t);
}
const at = {};
function Ka(e) {
	const t = at[e];
	if (t) return t;
	let n = g[e];
	if (xt(n)) return (at[e] = n.bind(g));
	const r = g.document;
	if (r && typeof r.createElement == 'function')
		try {
			const s = r.createElement('iframe');
			(s.hidden = !0), r.head.appendChild(s);
			const o = s.contentWindow;
			o && o[e] && (n = o[e]), r.head.removeChild(s);
		} catch (s) {
			U &&
				f.warn(
					`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `,
					s,
				);
		}
	return n && (at[e] = n.bind(g));
}
function Xn(e) {
	at[e] = void 0;
}
const ae = '__sentry_xhr_v3__';
function on(e) {
	const t = 'xhr';
	oe(t, e), ie(t, Va);
}
function Va() {
	if (!g.XMLHttpRequest) return;
	const e = XMLHttpRequest.prototype;
	(e.open = new Proxy(e.open, {
		apply(t, n, r) {
			const s = D() * 1e3,
				o = Ce(r[0]) ? r[0].toUpperCase() : void 0,
				i = Ja(r[1]);
			if (!o || !i) return t.apply(n, r);
			(n[ae] = { method: o, url: i, request_headers: {} }),
				o === 'POST' &&
					i.match(/sentry_key/) &&
					(n.__sentry_own_request__ = !0);
			const a = () => {
				const c = n[ae];
				if (c && n.readyState === 4) {
					try {
						c.status_code = n.status;
					} catch {}
					const u = { endTimestamp: D() * 1e3, startTimestamp: s, xhr: n };
					j('xhr', u);
				}
			};
			return (
				'onreadystatechange' in n && typeof n.onreadystatechange == 'function'
					? (n.onreadystatechange = new Proxy(n.onreadystatechange, {
							apply(c, u, l) {
								return a(), c.apply(u, l);
							},
					  }))
					: n.addEventListener('readystatechange', a),
				(n.setRequestHeader = new Proxy(n.setRequestHeader, {
					apply(c, u, l) {
						const [d, m] = l,
							h = u[ae];
						return (
							h && Ce(d) && Ce(m) && (h.request_headers[d.toLowerCase()] = m),
							c.apply(u, l)
						);
					},
				})),
				t.apply(n, r)
			);
		},
	})),
		(e.send = new Proxy(e.send, {
			apply(t, n, r) {
				const s = n[ae];
				if (!s) return t.apply(n, r);
				r[0] !== void 0 && (s.body = r[0]);
				const o = { startTimestamp: D() * 1e3, xhr: n };
				return j('xhr', o), t.apply(n, r);
			},
		}));
}
function Ja(e) {
	if (Ce(e)) return e;
	try {
		return e.toString();
	} catch {}
}
const Rt = [],
	ct = new Map();
function Za() {
	if (rn() && M) {
		const t = Qa();
		return () => {
			t();
		};
	}
	return () => {};
}
const zn = {
	click: 'click',
	pointerdown: 'click',
	pointerup: 'click',
	mousedown: 'click',
	mouseup: 'click',
	touchstart: 'click',
	touchend: 'click',
	mouseover: 'hover',
	mouseout: 'hover',
	mouseenter: 'hover',
	mouseleave: 'hover',
	pointerover: 'hover',
	pointerout: 'hover',
	pointerenter: 'hover',
	pointerleave: 'hover',
	dragstart: 'drag',
	dragend: 'drag',
	drag: 'drag',
	dragenter: 'drag',
	dragleave: 'drag',
	dragover: 'drag',
	drop: 'drag',
	keydown: 'press',
	keyup: 'press',
	keypress: 'press',
	input: 'press',
};
function Qa() {
	return ma(({ metric: e }) => {
		if (e.value == null) return;
		const t = e.entries.find((p) => p.duration === e.value && zn[p.name]);
		if (!t) return;
		const { interactionId: n } = t,
			r = zn[t.name],
			s = k(M + t.startTime),
			o = k(e.value),
			i = L(),
			a = i ? $(i) : void 0,
			u = (n != null ? ct.get(n) : void 0) || a,
			l = u ? v(u).description : C().getScopeData().transactionName,
			d = Se(t.target),
			m = fe({
				[A]: 'auto.http.browser.inp',
				[Ee]: `ui.interaction.${r}`,
				[Gt]: t.duration,
			}),
			h = Xr({ name: d, transaction: l, attributes: m, startTime: s });
		K([
			h,
			'optionalAccess',
			(p) => p.addEvent,
			'call',
			(p) => p('inp', { [St]: 'millisecond', [Et]: e.value }),
		]),
			K([h, 'optionalAccess', (p) => p.end, 'call', (p) => p(s + o)]);
	});
}
function ec(e) {
	const t = ({ entries: n }) => {
		const r = L(),
			s = r && $(r);
		n.forEach((o) => {
			if (!Ta(o) || !s) return;
			const i = o.interactionId;
			if (i != null && !ct.has(i)) {
				if (Rt.length > 10) {
					const a = Rt.shift();
					ct.delete(a);
				}
				Rt.push(i), ct.set(i, s);
			}
		});
	};
	$e('event', t), $e('first-input', t);
}
function tc(e, t = Ka('fetch')) {
	let n = 0,
		r = 0;
	function s(o) {
		const i = o.body.length;
		(n += i), r++;
		const a = {
			body: o.body,
			method: 'POST',
			referrerPolicy: 'origin',
			headers: e.headers,
			keepalive: n <= 6e4 && r < 15,
			...e.fetchOptions,
		};
		if (!t) return Xn('fetch'), dt('No fetch implementation available');
		try {
			return t(e.url, a).then(
				(c) => (
					(n -= i),
					r--,
					{
						statusCode: c.status,
						headers: {
							'x-sentry-rate-limits': c.headers.get('X-Sentry-Rate-Limits'),
							'retry-after': c.headers.get('Retry-After'),
						},
					}
				),
			);
		} catch (c) {
			return Xn('fetch'), (n -= i), r--, dt(c);
		}
	}
	return qo(e, s);
}
const nc = 30,
	rc = 50;
function jt(e, t, n, r) {
	const s = { filename: e, function: t === '<anonymous>' ? ye : t, in_app: !0 };
	return n !== void 0 && (s.lineno = n), r !== void 0 && (s.colno = r), s;
}
const sc = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
	oc =
		/^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
	ic = /\((\S*)(?::(\d+))(?::(\d+))\)/,
	ac = (e) => {
		const t = sc.exec(e);
		if (t) {
			const [, r, s, o] = t;
			return jt(r, ye, +s, +o);
		}
		const n = oc.exec(e);
		if (n) {
			if (n[2] && n[2].indexOf('eval') === 0) {
				const i = ic.exec(n[2]);
				i && ((n[2] = i[1]), (n[3] = i[2]), (n[4] = i[3]));
			}
			const [s, o] = zr(n[1] || ye, n[2]);
			return jt(o, s, n[3] ? +n[3] : void 0, n[4] ? +n[4] : void 0);
		}
	},
	cc = [nc, ac],
	uc =
		/^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
	dc = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
	lc = (e) => {
		const t = uc.exec(e);
		if (t) {
			if (t[3] && t[3].indexOf(' > eval') > -1) {
				const o = dc.exec(t[3]);
				o &&
					((t[1] = t[1] || 'eval'), (t[3] = o[1]), (t[4] = o[2]), (t[5] = ''));
			}
			let r = t[3],
				s = t[1] || ye;
			return (
				([s, r] = zr(s, r)),
				jt(r, s, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0)
			);
		}
	},
	fc = [rc, lc],
	pc = [cc, fc],
	mc = vs(...pc),
	zr = (e, t) => {
		const n = e.indexOf('safari-extension') !== -1,
			r = e.indexOf('safari-web-extension') !== -1;
		return n || r
			? [
					e.indexOf('@') !== -1 ? e.split('@')[0] : ye,
					n ? `safari-extension:${t}` : `safari-web-extension:${t}`,
			  ]
			: [e, t];
	},
	rt = 1024,
	hc = 'Breadcrumbs',
	gc = (e = {}) => {
		const t = {
			console: !0,
			dom: !0,
			fetch: !0,
			history: !0,
			sentry: !0,
			xhr: !0,
			...e,
		};
		return {
			name: hc,
			setup(n) {
				t.console && Fs(yc(n)),
					t.dom && ja(Sc(n, t.dom)),
					t.xhr && on(Tc(n)),
					t.fetch && Jt(vc(n)),
					t.history && sn(bc(n)),
					t.sentry && n.on('beforeSendEvent', Ec(n));
			},
		};
	},
	_c = gc;
function Ec(e) {
	return function (n) {
		T() === e &&
			pe(
				{
					category: `sentry.${
						n.type === 'transaction' ? 'transaction' : 'event'
					}`,
					event_id: n.event_id,
					level: n.level,
					message: ee(n),
				},
				{ event: n },
			);
	};
}
function Sc(e, t) {
	return function (r) {
		if (T() !== e) return;
		let s,
			o,
			i = typeof t == 'object' ? t.serializeAttribute : void 0,
			a =
				typeof t == 'object' && typeof t.maxStringLength == 'number'
					? t.maxStringLength
					: void 0;
		a &&
			a > rt &&
			(F &&
				f.warn(
					`\`dom.maxStringLength\` cannot exceed ${rt}, but a value of ${a} was configured. Sentry will use ${rt} instead.`,
				),
			(a = rt)),
			typeof i == 'string' && (i = [i]);
		try {
			const u = r.event,
				l = Ic(u) ? u.target : u;
			(s = Se(l, { keyAttrs: i, maxStringLength: a })), (o = mr(l));
		} catch {
			s = '<unknown>';
		}
		if (s.length === 0) return;
		const c = { category: `ui.${r.name}`, message: s };
		o && (c.data = { 'ui.component_name': o }),
			pe(c, { event: r.event, name: r.name, global: r.global });
	};
}
function yc(e) {
	return function (n) {
		if (T() !== e) return;
		const r = {
			category: 'console',
			data: { arguments: n.args, logger: 'console' },
			level: Ws(n.level),
			message: gn(n.args, ' '),
		};
		if (n.level === 'assert')
			if (n.args[0] === !1)
				(r.message = `Assertion failed: ${
					gn(n.args.slice(1), ' ') || 'console.assert'
				}`),
					(r.data.arguments = n.args.slice(1));
			else return;
		pe(r, { input: n.args, level: n.level });
	};
}
function Tc(e) {
	return function (n) {
		if (T() !== e) return;
		const { startTimestamp: r, endTimestamp: s } = n,
			o = n.xhr[ae];
		if (!r || !s || !o) return;
		const { method: i, url: a, status_code: c, body: u } = o,
			l = { method: i, url: a, status_code: c },
			d = { xhr: n.xhr, input: u, startTimestamp: r, endTimestamp: s },
			m = hr(c);
		pe({ category: 'xhr', data: l, type: 'http', level: m }, d);
	};
}
function vc(e) {
	return function (n) {
		if (T() !== e) return;
		const { startTimestamp: r, endTimestamp: s } = n;
		if (
			s &&
			!(n.fetchData.url.match(/sentry_key/) && n.fetchData.method === 'POST')
		)
			if (n.error) {
				const o = n.fetchData,
					i = {
						data: n.error,
						input: n.args,
						startTimestamp: r,
						endTimestamp: s,
					};
				pe({ category: 'fetch', data: o, level: 'error', type: 'http' }, i);
			} else {
				const o = n.response,
					i = { ...n.fetchData, status_code: o && o.status },
					a = {
						input: n.args,
						response: o,
						startTimestamp: r,
						endTimestamp: s,
					},
					c = hr(i.status_code);
				pe({ category: 'fetch', data: i, type: 'http', level: c }, a);
			}
	};
}
function bc(e) {
	return function (n) {
		if (T() !== e) return;
		let r = n.from,
			s = n.to;
		const o = ue(E.location.href);
		let i = r ? ue(r) : void 0;
		const a = ue(s);
		(!i || !i.path) && (i = o),
			o.protocol === a.protocol && o.host === a.host && (s = a.relative),
			o.protocol === i.protocol && o.host === i.host && (r = i.relative),
			pe({ category: 'navigation', data: { from: r, to: s } });
	};
}
function Ic(e) {
	return !!e && !!e.target;
}
const kc = [
		'EventTarget',
		'Window',
		'Node',
		'ApplicationCache',
		'AudioTrackList',
		'BroadcastChannel',
		'ChannelMergerNode',
		'CryptoOperation',
		'EventSource',
		'FileReader',
		'HTMLUnknownElement',
		'IDBDatabase',
		'IDBRequest',
		'IDBTransaction',
		'KeyOperation',
		'MediaController',
		'MessagePort',
		'ModalWindow',
		'Notification',
		'SVGElementInstance',
		'Screen',
		'SharedWorker',
		'TextTrack',
		'TextTrackCue',
		'TextTrackList',
		'WebSocket',
		'WebSocketWorker',
		'Worker',
		'XMLHttpRequest',
		'XMLHttpRequestEventTarget',
		'XMLHttpRequestUpload',
	],
	wc = 'BrowserApiErrors',
	Rc = (e = {}) => {
		const t = {
			XMLHttpRequest: !0,
			eventTarget: !0,
			requestAnimationFrame: !0,
			setInterval: !0,
			setTimeout: !0,
			...e,
		};
		return {
			name: wc,
			setupOnce() {
				t.setTimeout && H(E, 'setTimeout', Kn),
					t.setInterval && H(E, 'setInterval', Kn),
					t.requestAnimationFrame && H(E, 'requestAnimationFrame', Ac),
					t.XMLHttpRequest &&
						'XMLHttpRequest' in E &&
						H(XMLHttpRequest.prototype, 'send', Cc);
				const n = t.eventTarget;
				n && (Array.isArray(n) ? n : kc).forEach(Pc);
			},
		};
	},
	Nc = Rc;
function Kn(e) {
	return function (...t) {
		const n = t[0];
		return (
			(t[0] = Te(n, {
				mechanism: {
					data: { function: re(e) },
					handled: !1,
					type: 'instrument',
				},
			})),
			e.apply(this, t)
		);
	};
}
function Ac(e) {
	return function (t) {
		return e.apply(this, [
			Te(t, {
				mechanism: {
					data: { function: 'requestAnimationFrame', handler: re(e) },
					handled: !1,
					type: 'instrument',
				},
			}),
		]);
	};
}
function Cc(e) {
	return function (...t) {
		const n = this;
		return (
			['onload', 'onerror', 'onprogress', 'onreadystatechange'].forEach((s) => {
				s in n &&
					typeof n[s] == 'function' &&
					H(n, s, function (o) {
						const i = {
								mechanism: {
									data: { function: s, handler: re(o) },
									handled: !1,
									type: 'instrument',
								},
							},
							a = Kt(o);
						return a && (i.mechanism.data.handler = re(a)), Te(o, i);
					});
			}),
			e.apply(this, t)
		);
	};
}
function Pc(e) {
	const t = E,
		n = t[e] && t[e].prototype;
	!n ||
		!n.hasOwnProperty ||
		!n.hasOwnProperty('addEventListener') ||
		(H(n, 'addEventListener', function (r) {
			return function (s, o, i) {
				try {
					typeof o.handleEvent == 'function' &&
						(o.handleEvent = Te(o.handleEvent, {
							mechanism: {
								data: { function: 'handleEvent', handler: re(o), target: e },
								handled: !1,
								type: 'instrument',
							},
						}));
				} catch {}
				return r.apply(this, [
					s,
					Te(o, {
						mechanism: {
							data: { function: 'addEventListener', handler: re(o), target: e },
							handled: !1,
							type: 'instrument',
						},
					}),
					i,
				]);
			};
		}),
		H(n, 'removeEventListener', function (r) {
			return function (s, o, i) {
				const a = o;
				try {
					const c = a && a.__sentry_wrapped__;
					c && r.call(this, s, c, i);
				} catch {}
				return r.call(this, s, a, i);
			};
		}));
}
const Oc = 'GlobalHandlers',
	xc = (e = {}) => {
		const t = { onerror: !0, onunhandledrejection: !0, ...e };
		return {
			name: Oc,
			setupOnce() {
				Error.stackTraceLimit = 50;
			},
			setup(n) {
				t.onerror && (Lc(n), Vn('onerror')),
					t.onunhandledrejection && (Dc(n), Vn('onunhandledrejection'));
			},
		};
	},
	Fc = xc;
function Lc(e) {
	yr((t) => {
		const { stackParser: n, attachStacktrace: r } = Kr();
		if (T() !== e || Lr()) return;
		const { msg: s, url: o, line: i, column: a, error: c } = t,
			u = Hc(tn(n, c || s, void 0, r, !1), o, i, a);
		(u.level = 'error'),
			yt(u, {
				originalException: c,
				mechanism: { handled: !1, type: 'onerror' },
			});
	});
}
function Dc(e) {
	Tr((t) => {
		const { stackParser: n, attachStacktrace: r } = Kr();
		if (T() !== e || Lr()) return;
		const s = $c(t),
			o = Xt(s) ? Mc(s) : tn(n, s, void 0, r, !0);
		(o.level = 'error'),
			yt(o, {
				originalException: s,
				mechanism: { handled: !1, type: 'onunhandledrejection' },
			});
	});
}
function $c(e) {
	if (Xt(e)) return e;
	try {
		if ('reason' in e) return e.reason;
		if ('detail' in e && 'reason' in e.detail) return e.detail.reason;
	} catch {}
	return e;
}
function Mc(e) {
	return {
		exception: {
			values: [
				{
					type: 'UnhandledRejection',
					value: `Non-Error promise rejection captured with value: ${String(
						e,
					)}`,
				},
			],
		},
	};
}
function Hc(e, t, n, r) {
	const s = (e.exception = e.exception || {}),
		o = (s.values = s.values || []),
		i = (o[0] = o[0] || {}),
		a = (i.stacktrace = i.stacktrace || {}),
		c = (a.frames = a.frames || []),
		u = isNaN(parseInt(r, 10)) ? void 0 : r,
		l = isNaN(parseInt(n, 10)) ? void 0 : n,
		d = Ce(t) && t.length > 0 ? t : bs();
	return (
		c.length === 0 &&
			c.push({ colno: u, filename: d, function: ye, in_app: !0, lineno: l }),
		e
	);
}
function Vn(e) {
	F && f.log(`Global Handler attached: ${e}`);
}
function Kr() {
	const e = T();
	return (
		(e && e.getOptions()) || { stackParser: () => [], attachStacktrace: !1 }
	);
}
const Uc = () => ({
		name: 'HttpContext',
		preprocessEvent(e) {
			if (!E.navigator && !E.location && !E.document) return;
			const t = (e.request && e.request.url) || (E.location && E.location.href),
				{ referrer: n } = E.document || {},
				{ userAgent: r } = E.navigator || {},
				s = {
					...(e.request && e.request.headers),
					...(n && { Referer: n }),
					...(r && { 'User-Agent': r }),
				},
				o = { ...e.request, ...(t && { url: t }), headers: s };
			e.request = o;
		},
	}),
	Bc = 'cause',
	qc = 5,
	jc = 'LinkedErrors',
	Gc = (e = {}) => {
		const t = e.limit || qc,
			n = e.key || Bc;
		return {
			name: jc,
			preprocessEvent(r, s, o) {
				const i = o.getOptions();
				Rs(Qt, i.stackParser, i.maxValueLength, n, t, r, s);
			},
		};
	},
	Wc = Gc;
function Yc(e) {
	return [ei(), Vo(), Nc(), _c(), Fc(), Wc(), pi(), Uc()];
}
function Xc(e = {}) {
	const t = {
		defaultIntegrations: Yc(),
		release:
			typeof __SENTRY_RELEASE__ == 'string'
				? __SENTRY_RELEASE__
				: E.SENTRY_RELEASE && E.SENTRY_RELEASE.id
				? E.SENTRY_RELEASE.id
				: void 0,
		autoSessionTracking: !0,
		sendClientReports: !0,
	};
	return (
		e.defaultIntegrations == null && delete e.defaultIntegrations,
		{ ...t, ...e }
	);
}
function zc() {
	const e = typeof E.window < 'u' && E;
	if (!e) return !1;
	const t = e.chrome ? 'chrome' : 'browser',
		n = e[t],
		r = n && n.runtime && n.runtime.id,
		s = (E.location && E.location.href) || '',
		o = [
			'chrome-extension:',
			'moz-extension:',
			'ms-browser-extension:',
			'safari-web-extension:',
		],
		i = !!r && E === E.top && o.some((c) => s.startsWith(`${c}//`)),
		a = typeof e.nw < 'u';
	return !!r && !i && !a;
}
function Kc(e = {}) {
	const t = Xc(e);
	if (!t.skipBrowserExtensionCheck && zc()) {
		ht(() => {
			console.error(
				'[Sentry] You cannot run Sentry this way in a browser extension, check: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/',
			);
		});
		return;
	}
	F &&
		(_r() ||
			f.warn(
				'No Fetch API detected. The Sentry SDK requires a Fetch API compatible environment to send events. Please add a Fetch API polyfill.',
			));
	const n = {
			...t,
			stackParser: Is(t.stackParser || mc),
			integrations: Fo(t),
			transport: t.transport || tc,
		},
		r = Ho(ji, n);
	return t.autoSessionTracking && Vc(), r;
}
function Vc() {
	if (typeof E.document > 'u') {
		F &&
			f.warn(
				'Session tracking in non-browser environment with @sentry/browser is not supported.',
			);
		return;
	}
	_n({ ignoreDuration: !0 }),
		En(),
		sn(({ from: e, to: t }) => {
			e !== void 0 && e !== t && (_n({ ignoreDuration: !0 }), En());
		});
}
const Jc = 'HttpClient',
	Zc = (e = {}) => {
		const t = {
			failedRequestStatusCodes: [[500, 599]],
			failedRequestTargets: [/.*/],
			...e,
		};
		return {
			name: Jc,
			setup(n) {
				au(n, t), cu(n, t);
			},
		};
	},
	Qc = Zc;
function eu(e, t, n, r) {
	if (Jr(e, n.status, n.url)) {
		const s = uu(t, r);
		let o, i, a, c;
		Qr() && (([o, a] = Jn('Cookie', s)), ([i, c] = Jn('Set-Cookie', n)));
		const u = Zr({
			url: s.url,
			method: s.method,
			status: n.status,
			requestHeaders: o,
			responseHeaders: i,
			requestCookies: a,
			responseCookies: c,
		});
		yt(u);
	}
}
function Jn(e, t) {
	const n = ru(t.headers);
	let r;
	try {
		const s = n[e] || n[e.toLowerCase()] || void 0;
		s && (r = Vr(s));
	} catch {
		F && f.log(`Could not extract cookies from header ${e}`);
	}
	return [n, r];
}
function tu(e, t, n, r) {
	if (Jr(e, t.status, t.responseURL)) {
		let s, o, i;
		if (Qr()) {
			try {
				const c =
					t.getResponseHeader('Set-Cookie') ||
					t.getResponseHeader('set-cookie') ||
					void 0;
				c && (o = Vr(c));
			} catch {
				F && f.log('Could not extract cookies from response headers');
			}
			try {
				i = su(t);
			} catch {
				F && f.log('Could not extract headers from response');
			}
			s = r;
		}
		const a = Zr({
			url: t.responseURL,
			method: n,
			status: t.status,
			requestHeaders: s,
			responseHeaders: i,
			responseCookies: o,
		});
		yt(a);
	}
}
function nu(e) {
	if (e) {
		const t = e['Content-Length'] || e['content-length'];
		if (t) return parseInt(t, 10);
	}
}
function Vr(e) {
	return e.split('; ').reduce((t, n) => {
		const [r, s] = n.split('=');
		return r && s && (t[r] = s), t;
	}, {});
}
function ru(e) {
	const t = {};
	return (
		e.forEach((n, r) => {
			t[r] = n;
		}),
		t
	);
}
function su(e) {
	const t = e.getAllResponseHeaders();
	return t
		? t
				.split(
					`\r
`,
				)
				.reduce((n, r) => {
					const [s, o] = r.split(': ');
					return s && o && (n[s] = o), n;
				}, {})
		: {};
}
function ou(e, t) {
	return e.some((n) => (typeof n == 'string' ? t.includes(n) : n.test(t)));
}
function iu(e, t) {
	return e.some((n) =>
		typeof n == 'number' ? n === t : t >= n[0] && t <= n[1],
	);
}
function au(e, t) {
	Er() &&
		Jt((n) => {
			if (T() !== e) return;
			const { response: r, args: s } = n,
				[o, i] = s;
			r && eu(t, o, r, i);
		});
}
function cu(e, t) {
	'XMLHttpRequest' in I &&
		on((n) => {
			if (T() !== e) return;
			const r = n.xhr,
				s = r[ae];
			if (!s) return;
			const { method: o, request_headers: i } = s;
			try {
				tu(t, r, o, i);
			} catch (a) {
				F &&
					f.warn('Error while extracting response event form XHR response', a);
			}
		});
}
function Jr(e, t, n) {
	return (
		iu(e.failedRequestStatusCodes, t) &&
		ou(e.failedRequestTargets, n) &&
		!jo(n, T())
	);
}
function Zr(e) {
	const t = `HTTP Client Error with status code: ${e.status}`,
		n = {
			message: t,
			exception: { values: [{ type: 'Error', value: t }] },
			request: {
				url: e.url,
				method: e.method,
				headers: e.requestHeaders,
				cookies: e.requestCookies,
			},
			contexts: {
				response: {
					status_code: e.status,
					headers: e.responseHeaders,
					cookies: e.responseCookies,
					body_size: nu(e.responseHeaders),
				},
			},
		};
	return Le(n, { type: 'http.client', handled: !1 }), n;
}
function uu(e, t) {
	return (!t && e instanceof Request) || (e instanceof Request && e.bodyUsed)
		? e
		: new Request(e, t);
}
function Qr() {
	const e = T();
	return e ? !!e.getOptions().sendDefaultPii : !1;
}
const Zn = new WeakMap(),
	Nt = new Map(),
	ut = {
		traceFetch: !0,
		traceXHR: !0,
		enableHTTPTimings: !0,
		trackFetchStreamPerformance: !1,
	};
function du(e, t) {
	const {
			traceFetch: n,
			traceXHR: r,
			trackFetchStreamPerformance: s,
			shouldCreateSpanForRequest: o,
			enableHTTPTimings: i,
			tracePropagationTargets: a,
		} = {
			traceFetch: ut.traceFetch,
			traceXHR: ut.traceXHR,
			trackFetchStreamPerformance: ut.trackFetchStreamPerformance,
			...t,
		},
		c = typeof o == 'function' ? o : (d) => !0,
		u = (d) => mu(d, a),
		l = {};
	n &&
		(e.addEventProcessor(
			(d) => (
				d.type === 'transaction' &&
					d.spans &&
					d.spans.forEach((m) => {
						if (m.op === 'http.client') {
							const h = Nt.get(m.span_id);
							h && ((m.timestamp = h / 1e3), Nt.delete(m.span_id));
						}
					}),
				d
			),
		),
		s &&
			Ds((d) => {
				if (d.response) {
					const m = Zn.get(d.response);
					m && d.endTimestamp && Nt.set(m, d.endTimestamp);
				}
			}),
		Jt((d) => {
			const m = ki(d, c, u, l);
			if (
				(d.response &&
					d.fetchData.__span &&
					Zn.set(d.response, d.fetchData.__span),
				m)
			) {
				const h = es(d.fetchData.url),
					p = h ? ue(h).host : void 0;
				m.setAttributes({ 'http.url': h, 'server.address': p });
			}
			i && m && Qn(m);
		})),
		r &&
			on((d) => {
				const m = hu(d, c, u, l);
				i && m && Qn(m);
			});
}
function lu(e) {
	return (
		e.entryType === 'resource' &&
		'initiatorType' in e &&
		typeof e.nextHopProtocol == 'string' &&
		(e.initiatorType === 'fetch' || e.initiatorType === 'xmlhttprequest')
	);
}
function Qn(e) {
	const { url: t } = v(e).data || {};
	if (!t || typeof t != 'string') return;
	const n = $e('resource', ({ entries: r }) => {
		r.forEach((s) => {
			lu(s) &&
				s.name.endsWith(t) &&
				(pu(s).forEach((i) => e.setAttribute(...i)), setTimeout(n));
		});
	});
}
function fu(e) {
	let t = 'unknown',
		n = 'unknown',
		r = '';
	for (const s of e) {
		if (s === '/') {
			[t, n] = e.split('/');
			break;
		}
		if (!isNaN(Number(s))) {
			(t = r === 'h' ? 'http' : r), (n = e.split(r)[1]);
			break;
		}
		r += s;
	}
	return r === e && (t = r), { name: t, version: n };
}
function W(e = 0) {
	return ((M || performance.timeOrigin) + e) / 1e3;
}
function pu(e) {
	const { name: t, version: n } = fu(e.nextHopProtocol),
		r = [];
	return (
		r.push(['network.protocol.version', n], ['network.protocol.name', t]),
		M
			? [
					...r,
					['http.request.redirect_start', W(e.redirectStart)],
					['http.request.fetch_start', W(e.fetchStart)],
					['http.request.domain_lookup_start', W(e.domainLookupStart)],
					['http.request.domain_lookup_end', W(e.domainLookupEnd)],
					['http.request.connect_start', W(e.connectStart)],
					['http.request.secure_connection_start', W(e.secureConnectionStart)],
					['http.request.connection_end', W(e.connectEnd)],
					['http.request.request_start', W(e.requestStart)],
					['http.request.response_start', W(e.responseStart)],
					['http.request.response_end', W(e.responseEnd)],
			  ]
			: r
	);
}
function mu(e, t) {
	const n = E.location && E.location.href;
	if (n) {
		let r, s;
		try {
			(r = new URL(e, n)), (s = new URL(n).origin);
		} catch {
			return !1;
		}
		const o = r.origin === s;
		return t ? ce(r.toString(), t) || (o && ce(r.pathname, t)) : o;
	} else {
		const r = !!e.match(/^\/(?!\/)/);
		return t ? ce(e, t) : r;
	}
}
function hu(e, t, n, r) {
	const s = e.xhr,
		o = s && s[ae];
	if (!s || s.__sentry_own_request__ || !o) return;
	const i = se() && t(o.url);
	if (e.endTimestamp && i) {
		const m = s.__sentry_xhr_span_id__;
		if (!m) return;
		const h = r[m];
		h &&
			o.status_code !== void 0 &&
			(fr(h, o.status_code), h.end(), delete r[m]);
		return;
	}
	const a = es(o.url),
		c = a ? ue(a).host : void 0,
		u = !!L(),
		l =
			i && u
				? He({
						name: `${o.method} ${o.url}`,
						attributes: {
							type: 'xhr',
							'http.method': o.method,
							'http.url': a,
							url: o.url,
							'server.address': c,
							[A]: 'auto.http.browser',
							[Ee]: 'http.client',
						},
				  })
				: new ke();
	(s.__sentry_xhr_span_id__ = l.spanContext().spanId),
		(r[s.__sentry_xhr_span_id__] = l);
	const d = T();
	return (
		s.setRequestHeader && n(o.url) && d && gu(s, d, se() && u ? l : void 0), l
	);
}
function gu(e, t, n) {
	const r = C(),
		s = be(),
		{
			traceId: o,
			spanId: i,
			sampled: a,
			dsc: c,
		} = { ...s.getPropagationContext(), ...r.getPropagationContext() },
		u = n && se() ? ur(n) : dr(o, i, a),
		l = lr(c || (n ? ve(n) : zt(o, t)));
	_u(e, u, l);
}
function _u(e, t, n) {
	try {
		e.setRequestHeader('sentry-trace', t), n && e.setRequestHeader(ge, n);
	} catch {}
}
function es(e) {
	try {
		return new URL(e, E.location.origin).href;
	} catch {
		return;
	}
}
function Eu() {
	E && E.document
		? E.document.addEventListener('visibilitychange', () => {
				const e = L();
				if (!e) return;
				const t = $(e);
				if (E.document.hidden && t) {
					const n = 'cancelled',
						{ op: r, status: s } = v(t);
					F &&
						f.log(
							`[Tracing] Transaction: ${n} -> since tab moved to the background, op: ${r}`,
						),
						s || t.setStatus({ code: Fe, message: n }),
						t.setAttribute('sentry.cancellation_reason', 'document.hidden'),
						t.end();
				}
		  })
		: F &&
		  f.warn(
				'[Tracing] Could not set up background tab detection due to lack of global document',
		  );
}
const Su = 'BrowserTracing',
	yu = {
		...it,
		instrumentNavigation: !0,
		instrumentPageLoad: !0,
		markBackgroundSpan: !0,
		enableLongTask: !0,
		enableLongAnimationFrame: !0,
		enableInp: !0,
		_experiments: {},
		...ut,
	},
	Tu = (e = {}) => {
		io();
		const {
				enableInp: t,
				enableLongTask: n,
				enableLongAnimationFrame: r,
				_experiments: { enableInteractions: s, enableStandaloneClsSpans: o },
				beforeStartSpan: i,
				idleTimeout: a,
				finalTimeout: c,
				childSpanTimeout: u,
				markBackgroundSpan: l,
				traceFetch: d,
				traceXHR: m,
				trackFetchStreamPerformance: h,
				shouldCreateSpanForRequest: p,
				enableHTTPTimings: _,
				instrumentPageLoad: G,
				instrumentNavigation: B,
			} = { ...yu, ...e },
			J = wa({ recordClsStandaloneSpans: o || !1 });
		t && Za(),
			r &&
			I.PerformanceObserver &&
			PerformanceObserver.supportedEntryTypes &&
			PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')
				? Na()
				: n && Ra(),
			s && Aa();
		const Z = { name: void 0, source: void 0 };
		function We(P, y) {
			const w = y.op === 'pageload',
				b = i ? i(y) : y,
				O = b.attributes || {};
			y.name !== b.name && ((O[te] = 'custom'), (b.attributes = O)),
				(Z.name = b.name),
				(Z.source = O[te]);
			const q = Ar(b, {
				idleTimeout: a,
				finalTimeout: c,
				childSpanTimeout: u,
				disableAutoFinish: w,
				beforeSpanEnd: (R) => {
					J(), Fa(R, { recordClsOnPageloadSpan: !o });
				},
			});
			function x() {
				['interactive', 'complete'].includes(E.document.readyState) &&
					P.emit('idleSpanEnableAutoFinish', q);
			}
			return (
				w &&
					E.document &&
					(E.document.addEventListener('readystatechange', () => {
						x();
					}),
					x()),
				q
			);
		}
		return {
			name: Su,
			afterAllSetup(P) {
				let y,
					w = E.location && E.location.href;
				P.on('startNavigationSpan', (b) => {
					T() === P &&
						(y &&
							!v(y).timestamp &&
							(F &&
								f.log(
									`[Tracing] Finishing current root span with op: ${v(y).op}`,
								),
							y.end()),
						(y = We(P, { op: 'navigation', ...b })));
				}),
					P.on('startPageLoadSpan', (b, O = {}) => {
						if (T() !== P) return;
						y &&
							!v(y).timestamp &&
							(F &&
								f.log(
									`[Tracing] Finishing current root span with op: ${v(y).op}`,
								),
							y.end());
						const q = O.sentryTrace || er('sentry-trace'),
							x = O.baggage || er('baggage'),
							R = ks(q, x);
						C().setPropagationContext(R), (y = We(P, { op: 'pageload', ...b }));
					}),
					P.on('spanEnd', (b) => {
						const O = v(b).op;
						if (b !== $(b) || (O !== 'navigation' && O !== 'pageload')) return;
						const q = C(),
							x = q.getPropagationContext();
						q.setPropagationContext({
							...x,
							sampled: x.sampled !== void 0 ? x.sampled : _t(b),
							dsc: x.dsc || ve(b),
						});
					}),
					E.location &&
						(G &&
							vu(P, {
								name: E.location.pathname,
								startTime: M ? M / 1e3 : void 0,
								attributes: { [te]: 'url', [A]: 'auto.pageload.browser' },
							}),
						B &&
							sn(({ to: b, from: O }) => {
								if (O === void 0 && w && w.indexOf(b) !== -1) {
									w = void 0;
									return;
								}
								O !== b &&
									((w = void 0),
									bu(P, {
										name: E.location.pathname,
										attributes: { [te]: 'url', [A]: 'auto.navigation.browser' },
									}));
							})),
					l && Eu(),
					s && Iu(a, c, u, Z),
					t && ec(),
					du(P, {
						traceFetch: d,
						traceXHR: m,
						trackFetchStreamPerformance: h,
						tracePropagationTargets: P.getOptions().tracePropagationTargets,
						shouldCreateSpanForRequest: p,
						enableHTTPTimings: _,
					});
			},
		};
	};
function vu(e, t, n) {
	e.emit('startPageLoadSpan', t, n), C().setTransactionName(t.name);
	const r = L();
	return (r && v(r).op) === 'pageload' ? r : void 0;
}
function bu(e, t) {
	be().setPropagationContext(Sn()),
		C().setPropagationContext(Sn()),
		e.emit('startNavigationSpan', t),
		C().setTransactionName(t.name);
	const n = L();
	return (n && v(n).op) === 'navigation' ? n : void 0;
}
function er(e) {
	const t = ws(`meta[name=${e}]`);
	return t ? t.getAttribute('content') : void 0;
}
function Iu(e, t, n, r) {
	let s;
	const o = () => {
		const i = 'ui.action.click',
			a = L(),
			c = a && $(a);
		if (c) {
			const u = v(c).op;
			if (['navigation', 'pageload'].includes(u)) {
				F &&
					f.warn(
						`[Tracing] Did not create ${i} span because a pageload or navigation span is in progress.`,
					);
				return;
			}
		}
		if (
			(s &&
				(s.setAttribute(At, 'interactionInterrupted'), s.end(), (s = void 0)),
			!r.name)
		) {
			F &&
				f.warn(
					`[Tracing] Did not create ${i} transaction because _latestRouteName is missing.`,
				);
			return;
		}
		s = Ar(
			{ name: r.name, op: i, attributes: { [te]: r.source || 'url' } },
			{ idleTimeout: e, finalTimeout: t, childSpanTimeout: n },
		);
	};
	E.document && addEventListener('click', o, { once: !1, capture: !0 });
}
const ts = '3.0.19';
console.log(`Version: ${ts}`);
const tr = window.location.hostname === 'localhost';
tr
	? console.log('Sentry disabled because running on localhost')
	: Kc({
			dsn: 'https://a7f7f274b02453ac333f977c0cc71b92@o193370.ingest.sentry.io/4506039862034432',
			environment: tr ? 'test' : 'production',
			release: ts,
			integrations: [Tu(), Si(), Qc(), Ii()],
			sendDefaultPii: !0,
			ignoreErrors: [
				'Failed to fetch dynamically imported module',
				'NetworkError',
			],
			tracesSampleRate: 0.2,
			tracePropagationTargets: [
				'localhost',
				/^https:\/\/www\.fitfileviewer\.com/,
			],
	  });
