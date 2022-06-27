import { observer } from 'mobx-react';
import { Component } from 'react';
import { Log } from '../../AppStore';

@observer
export class SceneApp extends Component<any, any> {
	mount: HTMLDivElement | null = null;

	constructor(props: {}) {
		super(props);
	}

	componentDidMount() {
		// AppStore.scene.initializer.setupCanvas(this.mount);
	}

	componentWillUnmount() {
		Log('SceneComponent end!');
	}

	render() {
		return (
			<div>
				<div ref={ref => (this.mount = ref)} style={{
					position: 'fixed'
				}} />
				{this.props.children}
			</div>
		);
	}
}
