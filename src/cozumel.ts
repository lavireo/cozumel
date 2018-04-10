#!/usr/bin/env node
import {App} from "./core"
try { new App(process.argv) }
catch (err) {}