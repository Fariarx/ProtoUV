import { Job, WorkerType } from './Job';

export let isWorking = false;

const jobList: Array<Job> = [];

export const addJob = (job: Job) =>
{
	if(!isWorking)
	{
		isWorking = true;

		switch (job.name)
		{
			case WorkerType.SliceFullScene:
				break;
		}
	}
	else
	{
		jobList.push(job);
	}
};

export const finishJob = () => {
	isWorking = false;

	if(jobList.length > 0)
	{
		addJob(jobList[0]);
		jobList.splice(0, 1);
	}
};
