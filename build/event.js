/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:04
*/
KISSY.add("event",["event/dom","event/custom"],function(b,c){var a=b.Event={};b.mix(a,c("event/dom"));a.Target=c("event/custom").Target;return a});
