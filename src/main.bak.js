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

const copyTemplateFiles = async (options)=>{
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false
    });
}

const initGit = async (options) => {
    const result = await execa('git', ['init'],{
       cwd: options.targetDirectory 
    });

    if(result.failed)
        return Promise.reject(new Error('Failed to initialize Git'));
    
    return;
};

async function createProject(options){
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    }

    //const currentFileUrl = import.meta.url;
    //const templateDir = path.resolve(new URL(currentFileUrl).pathname, '../../templates', options.template.toLowerCase());
    const templateDir = path.resolve(__dirname, '../templates', options.template.toLowerCase());

    options.templateDirectory = templateDir;

    try{
        await access(templateDir, fs.constants.R_OK);
    } catch(err){
        console.error(`%s Invalid template name ${templateDir} ${err}`, chalk.red.bold('ERROR'));
        process.exit(1);
    }
    
    const task = new Listr([
        {
            title: 'Copy project files',
            task: () => copyTemplateFiles(options)
        },
        {
            title: 'Initialize Git',
            task: () => initGit(options),
            enabled: () => options.git
        },
        {
            title: 'Install dependencies',
            task: () => projectInstall({cwd: options.targetDirectory}),
            skip: () => !options.runInstall ? 'Pass --install to auto' : undefined
        }
    ]);

   await task.run(); 

    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;
} 

module.exports = {
    createProject
}