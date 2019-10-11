import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

export class processMain{

    constructor(options){
        if(!options.generate)
            return console.log('%s Please we only have an option -g or --generate', chalk.yellow.bold('INFO'))

        
        return console.log('%s Ok todo listo!', chalk.green.bold('DONE'));
        
    }
};