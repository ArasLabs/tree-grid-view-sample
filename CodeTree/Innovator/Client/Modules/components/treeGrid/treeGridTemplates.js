import gridFormatters from '../grid/formatters';
import gridTemplates from '../grid/templates';

function treeGridTemplates() {
	const levelClass = 'aras-grid-row-levelpad';
	const levelFilledClass = levelClass + ' aras-grid-row-levelpad-filled';
	const expandButtonClass = 'aras-treegrid-expand-button';
	const minusClass = expandButtonClass + ' aras-icon-minus';
	const plusClass = expandButtonClass + ' aras-icon-plus';
	const loadingClass = expandButtonClass + ' aras-icon-loading';
	const backgroundImage =
		'radial-gradient(circle at 0 0, #9C9C9C 1px, transparent 1px, transparent 100%)';
	const levelPaddingBackgroundoffset = 4.5;

	const templates = {
		getRowClasses: function(grid, row) {
			let classes = 'aras-grid-row';
			if (row.selected) {
				classes += ' aras-grid-row_selected';
			}

			if (row.animations) {
				classes += ' ' + row.animations;
			}

			const customClasses = grid.getRowClasses(row.id);
			if (customClasses) {
				classes += ' ' + customClasses;
			}

			return classes;
		},
		getCellTemplate: function(grid, row, head, value) {
			const type = grid._getCellType(head.id, row.id, value, grid);
			const cellMetadata = grid.getCellMetadata(head.id, row.id, type);
			const formatter = gridFormatters[type];
			const template = formatter
				? formatter(head.id, row.id, value, grid, cellMetadata)
				: {};

			const cellStyles = getCellStyles(row.id, head.index, head.data.label);
			if (!head.treeHeadView) {
				return Object.assign(template, cellStyles ? { style:  cellStyles } : undefined);
			}
			let expandButtonClassName;
			if (row.loading) {
				expandButtonClassName = loadingClass;
			} else {
				expandButtonClassName = row.expanded ? minusClass : plusClass;
			}

			const backgroundWidth = grid.view.defaultSettings.levelPaddingMultiplier;
			const bgPositions = (row.levelLines || []).reduce(function(
				array,
				elm,
				index
			) {
				if (elm) {
					array.push(index * backgroundWidth + levelPaddingBackgroundoffset);
				}
				return array;
			},
			[]);

			const bgParameters = bgPositions.reduce(
				function(prev, elm) {
					prev.images.push(backgroundImage);
					prev.positions.push(elm + 'px');
					return prev;
				},
				{
					images: [],
					positions: []
				}
			);

			return Object.assign(template, {
				className: row.className,
				children: [
					{
						tag: 'div',
						className: 'aras-treegrid-cell-container',
						children: ((row.levelLines || []).length
							? [
									{
										tag: 'span',
										className: levelFilledClass,
										style: {
											'background-image': bgParameters.images.join(','),
											'background-position': bgParameters.positions.join(','),
											width:
												backgroundWidth * (row.levelLines || []).length + 'px'
										}
									}
							  ]
							: []
						).concat([
							{
								tag: 'span',
								className: levelFilledClass,
								children: !row.data.children
									? ''
									: [
											{
												tag: 'div',
												className: expandButtonClassName
											}
									  ]
							},
							{
								tag: 'span',
								className: template.className || '',
								children: template.children || [value]
							}
						])
					}
				]
			},
			cellStyles ? { style:  cellStyles } : undefined);
		}
	};
	return gridTemplates(templates);
}

function getCellStyles(rowId, index, columnName)
{
	try {
		const data_object = mainPage._grid.getUserData(rowId, 'data_object');
		var res = JSON.parse(data_object[index]);

		return res ? res.styles : null;
	}
	catch
	{
		console.warn(`'Data Template' for some node in column called ${columnName} has not correct json format`);
		return null;
	}
}

export default treeGridTemplates;
