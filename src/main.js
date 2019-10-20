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

        if(options.project)
            this.createProject(options);

        if(options.endPoint)
            this.createEndPoint(options);
        
        
        return console.log('%s Ok todo listo!', chalk.green.bold('DONE'));
        
    }

    async createProject(options){
        options = {
            ...options,
            targetDirectory: options.targetDirectory || process.cwd(),
        }

        const templateDir = path.resolve(__dirname, '../templates', options.component_name.toLowerCase());
        options.templateDirectory = templateDir;

        try{
            await access(templateDir, fs.constants.R_OK)
        } catch(error){
            console.error(`%s Invalid template name ${templateDir} ${error}`, chalk.red.bold('ERROR'));
            process.exit(1);
        }

        const task = new Listr([
            {
                title: 'Copy Project Files',
                task: () => this.copyTemplateFiles(options)
            }
        ]);

        await task.run();

        console.log('%s Project Ready', chalk.green.bold('DONE'));
        return true;
    }

    createEndPoint(options){
        
    }

    copyTemplateFiles(options){
        return copy(options.templateDirectory, options.targetDirectory, {
            clobber: false
        });
    }

    
};