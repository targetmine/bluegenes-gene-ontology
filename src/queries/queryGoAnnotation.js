const queryGoAnnotation = (entityId, path) => ({
	from: 'Gene',
	select: [
		'goAnnotation.ontologyTerm.name',
		'goAnnotation.ontologyTerm.description',
		'goAnnotation.evidence.code.code',
		'goAnnotation.evidence.code.name',
		'goAnnotation.ontologyTerm.namespace'
	],
	orderBy: [
		{
			path: 'goAnnotation.ontologyTerm.namespace',
			direction: 'ASC'
		}
	],
	where: [
		{
			path: path,
			op: '=',
			value: entityId
		}
	]
});

// eslint-disable-next-line
function queryData(entityId, path, serviceUrl, imjsClient = imjs) {
	return new Promise((resolve, reject) => {
		const service = new imjsClient.Service({ root: serviceUrl });
		service
			.records(queryGoAnnotation(entityId, path))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No GO Annotation available.');
			})
			.catch(reject);
	});
}

module.exports = queryData;
