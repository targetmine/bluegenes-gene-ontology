import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import queryGoAnnotation from './queries/queryGoAnnotation';
import Loading from './loading';

const namespaces = [
	'biological_process',
	'molecular_function',
	'cellular_component'
];

function resultsToNamespaceBuckets(response) {
	const terms = {
		molecular_function: [],
		cellular_component: [],
		biological_process: []
	};
	response.goAnnotation.forEach(function(result) {
		terms[result.ontologyTerm.namespace].push(result);
	});
	return terms;
}

const useStyles = makeStyles({
	root: {
		flexGrow: 1
	}
});

const TabPanel = props => {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box p={3}>{children}</Box>}
		</div>
	);
};

const GeneOntologyTabs = props => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<div>
			<Paper className={classes.root}>
				<Tabs
					value={value}
					onChange={handleChange}
					indicatorColor="primary"
					textColor="primary"
					variant="fullWidth"
				>
					{props.labels.map((label, index) => (
						<Tab key={index} label={label}></Tab>
					))}
				</Tabs>
			</Paper>
			{props.children.map((child, index) => (
				<TabPanel key={index} value={value} index={index}>
					{child}
				</TabPanel>
			))}
		</div>
	);
};

class GOAnnotationTable extends React.Component {
	render() {
		const data = this.props.data;
		if (data) {
			if (data.length) {
				return (
					<table className="annotationTable">
						<thead>
							<tr>
								<th>Gene Ontology term</th>
								<th>Evidence</th>
							</tr>
						</thead>
						<tbody>
							{data.map((row, index) => (
								<tr key={index} className={index % 2 ? 'odd' : 'even'}>
									<td>
										<span
											className="naviLink"
											onClick={() => {
												this.props.navigate('report', {
													type: row.ontologyTerm.class,
													id: row.ontologyTerm.objectId
												});
											}}
											title={row.ontologyTerm.description}
										>
											{row.ontologyTerm.name}
										</span>
									</td>
									<td>
										{row.evidence.map((evi, index) => (
											<span
												key={index}
												className="evidence"
												title={evi.code.name}
											>
												{evi.code.code}
											</span>
										))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				);
			} else {
				return <p className="noData">No terms in this category.</p>;
			}
		} else {
			return <Loading />;
		}
	}
}

class RootContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			terms: [],
			log: ''
		};
	}

	componentDidMount() {
		const entity = this.props.entity.Gene || this.props.entity.Protein;
		const paths = { Gene: 'Gene.id', Protein: 'Gene.proteins.id' };

		queryGoAnnotation(entity.value, paths[entity.class], this.props.serviceUrl)
			.then(res => {
				const terms = resultsToNamespaceBuckets(res);
				this.setState({ terms: terms });
			})
			.catch(error => {
				const terms = {
					molecular_function: [],
					cellular_component: [],
					biological_process: []
				};
				this.setState({ terms: terms, log: error });
			});
	}

	render() {
		return (
			<div className="rootContainer">
				<GeneOntologyTabs labels={namespaces}>
					<div>
						<GOAnnotationTable
							ns={namespaces[0]}
							data={this.state.terms[namespaces[0]]}
							navigate={this.props.navigate}
						></GOAnnotationTable>
					</div>
					<div>
						<GOAnnotationTable
							ns={namespaces[1]}
							data={this.state.terms[namespaces[1]]}
							navigate={this.props.navigate}
						></GOAnnotationTable>
					</div>
					<div>
						<GOAnnotationTable
							ns={namespaces[2]}
							data={this.state.terms[namespaces[2]]}
							navigate={this.props.navigate}
						></GOAnnotationTable>
					</div>
				</GeneOntologyTabs>
			</div>
		);
	}
}

export default RootContainer;
