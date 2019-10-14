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
        
        if(!options.generate && (!options.project || !options.endPoint || !options.controller || !options.model) && options.component_name)
            return console.log(`%s Invalid option \n Please we only have an option -g or --generate or use simple 'qatar' command`, chalk.yellow.bold('INFO'))

        
        return console.log('%s Ok todo listo!', chalk.green.bold('DONE'));
        
    }

    createProject(options){
        options = {
            ...options,
            targetDirectory: options.targetDirectory || process.cwd(),
        }
    }
};