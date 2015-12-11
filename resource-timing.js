/*!
 * Copyright 2015 Comcast Cable Communications Management, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
!function(a,b){"function"==typeof define&&define.amd?define("surfnperf/resource-timing",["surfnperf"],b):"object"==typeof exports?module.exports=b(require("surfnperf")):a.surfnperfRT=b(a.surfnperf)}(this,function(a){var b=function(a,b){if(Array.prototype.indexOf)return-1!=a.indexOf(b);var c,d=a.length;for(c=0;d>c;c++)if(a[c]===b)return!0;return!1},c=function(){this._resourceTiming=null,this.initialize()},d=c.prototype;return d.initialize=function(){window.performance?this._resourceTiming=!!window.performance.getEntriesByType:this._resourceTiming=!1},d._inList=function(a,c){return c=c||{},c.hasOwnProperty("whitelist")?b(c.whitelist,a):c.hasOwnProperty("blacklist")?!b(c.blacklist,a):!0},d._getURLOrigin=function(a){var b=document.createElement("a");return b.href=a,b.protocol+"//"+b.host},d.getOrigins=function(a){if(this._resourceTiming){var c=window.performance.getEntriesByType("resource"),d=[];for(var e in c){var f=this._getURLOrigin(c[e].name);!b(d,f)&&this._inList(f,a)&&d.push(f)}return d}return null},d.getResourcesFromOrigin=function(a){if(this._resourceTiming){var b=window.performance.getEntriesByType("resource"),c=[];for(var d in b){var e=this._getURLOrigin(b[d].name);e===a&&c.push(b[d])}return c}return null},d.getLocation=function(){return window.location},d._name=function(a){if("/"==a.charAt(0)){var b=this.getLocation();return b.protocol+"//"+b.host+a}return a},d.getResource=function(a){return this._resourceTiming?window.performance.getEntriesByName(this._name(a),"resource")[0]:null},d.duration=function(b,c,d,e){if(this._resourceTiming){var f=this.getResource(b);return f?0===f[c]||0===f[d]?!1:a._roundedDuration(f[c],f[d],e):void 0}return null},d.start=function(b,c){if(!this._resourceTiming)return null;var d=this.getResource(b);return d?a._round(d.startTime,c):void 0},d.end=function(b,c){if(!this._resourceTiming)return null;var d=this.getResource(b);return d?a._round(d.responseEnd,c):void 0},d.getFullRequestLoadTime=function(b,c){return this._resourceTiming?a._round(this.getResource(b).duration,c):null},d.getNetworkTime=function(a,b){return this._resourceTiming?this.duration(a,"fetchStart","connectEnd",b):null},d.getServerTime=function(a,b){return this._resourceTiming?this.duration(a,"requestStart","responseEnd",b):null},d.getBlockingTime=function(b,c){if(this._resourceTiming){var d=0,e=this.getResource(b);return e.connectEnd&&e.connectEnd===e.fetchStart?d=e.requestStart-e.connectEnd:e.domainLookupStart&&(d=e.domainLookupStart-e.fetchStart),a._round(d,c)}return null},new c});