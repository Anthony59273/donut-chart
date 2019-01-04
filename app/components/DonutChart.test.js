import * as d3 from 'd3';

import { DonutChart } from './DonutChart';

describe('DonutChart', () => {
  let component, svgGroup;

  beforeEach(() => {
    svgGroup = d3.select('svg');

    component = new DonutChart(svgGroup, {
      info: {
        title: 'REVENUE',
        unit: '€'
      },
      values: [
        {
          label: 'Tablet',
          value: '120000',
          color: '#8ed543'
        },
        {
          label: 'Smartphone',
          value: '80000',
          color: '#486f24'
        }
      ]
    }, 0);
  });

  it('should be able to add all the donut lines', () => {
    spyOn(component, 'addDonutLine');

    component.addDonutLines();
    expect(component.addDonutLine).toHaveBeenCalledTimes(4);
  });

  it('should be able to calculate the total', () => {
    const total = component.calculateTotal([
      { value: 10 },
      { value: 30 }
    ]);

    expect(total).toEqual(40);
  });

  it('should be able to format a number', () => {
    expect(component.formatNumber(1234567890)).toEqual('1.234.567.890');
    expect(component.formatNumber(1234567890, '€')).toEqual('1.234.567.890€');
  });

  it('should be able to calculate a percentage', () => {
    let percentage = component.calculatePercentage([
      { value: 30 },
      { value: 70 }
    ], 0);

    expect(percentage).toEqual(30);

    percentage = component.calculatePercentage([
      { value: 30 },
      { value: 70 }
    ], 1);

    expect(percentage).toEqual(70);

    percentage = component.calculatePercentage([
      { value: 1 },
      { value: 100 }
    ], 0);

    expect(percentage).toEqual(1);
  });

});
