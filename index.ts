/// <reference path="./library/globals.d.ts" />

import { data } from './library/data';
import { file } from './library/file';
import { type } from './library/type';
import { array } from './library/array';
import { chain } from './library/chain';
import { fetch } from './library/fetch';
import { unzip } from './library/unzip';
import { simplify } from './library/simplify';
import { transfer } from './library/transfer';

import * as meta from './library/core';
import * as poly from './library/poly';
import * as task from './library/task';
import * as format from './library/format';
import * as console from './library/console';

export const core = {
   array,
   chain,
   console,
   data,
   fetch,
   file,
   format,
   meta,
   reload () {
      Core.push(Core.swap);
   },
   simplify,
   task,
   transfer,
   type,
   unzip
};

Object.assign(globalThis, poly, {
   global: globalThis
});
