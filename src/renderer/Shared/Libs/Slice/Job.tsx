
export enum WorkerType {
  SliceFullScene
}

export type JobSliceOneLayerOptions =
{
  layerNum: number;
};

export type JobOptions = {
  name: WorkerType;
  data?: JobSliceOneLayerOptions;
  onResult: (data: any) => void;
  onState?: (percent: number) => boolean | void;
};

export class Job
{
	name: WorkerType;

	data: any;

	onResult: (data: any) => void;
	onState: (data: any) => boolean | void;

	constructor(jobOptions: JobOptions)
	{
		this.name = jobOptions.name;
		this.onResult = jobOptions.onResult;
		this.onState = jobOptions.onState ? jobOptions. onState : () => {};
		this.data = jobOptions.data ? jobOptions.data : {};
	}
}
