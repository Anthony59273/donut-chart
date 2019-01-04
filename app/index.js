import * as d3 from 'd3';

import { DonutChart } from './components/DonutChart';
import { INITIAL_MARGIN } from './constants';

const svg = d3.select('svg'),
  svgGroup = svg.append('g')
    .attr('transform', `translate(${INITIAL_MARGIN}, ${INITIAL_MARGIN})`);

d3.json('../data.json').then(data => {
  data.data.forEach((d, index) => {
    d.values.forEach(value => {
      value.value = +value.value;
    });

    new DonutChart(svgGroup, d, index);
  });
}).catch(error => {
  console.error('An error ocurred while trying to fetch json file', error);
});
