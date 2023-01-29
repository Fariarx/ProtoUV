import { Component } from 'react';
import { AppStore, Log } from '../../AppStore';

export class SceneApp extends Component<any, any> {
	mountRenderer: HTMLDivElement | null = null;
	mountSliceRenderer: HTMLDivElement | null = null;

	public constructor(public props: { width: number } | any) {
		super(props);
	}

	componentDidMount() {
		AppStore.sceneStore.setupCanvas(this.mountRenderer, this.mountSliceRenderer);
	}

	componentWillUnmount() {
		Log('SceneComponent end!');
	}

	render() {

		return (
			<div
				onWheel={(evt) =>
					AppStore.sceneStore.handleOnZoom(evt)}
				style={{
					width: '100%',
					height: '100%'
				}}>
				<div style={{
					width: '100%',
					height: '100%'
				}} ref={ref => (this.mountRenderer = ref)}/>
				<div style={{
					width: '0',
					height: '0',
					position: 'absolute',
					top: 78, left: 78,
					overflow: 'hidden'
				}} ref={ref => (this.mountSliceRenderer = ref)}/>
				{this.props.children}
			</div>
		);
	}
}
