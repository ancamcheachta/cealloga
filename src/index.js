#!/usr/bin/env node
/**
 * @desc Executable for cealloga.
 * @todo Add `argparse` support
 * @since 0.2.0
 */
'use strict';

require('./cealloga').onListen(
    (port) => console.log(`Ceallóga app listening on port ${port}`)
);
