import * as d3 from 'd3';

import { PIE_RADIUS, DONUT_STROKE_SIZE, MARGIN, GREY, DONUT_LINE_LENGTH, WIDTH, TEXT_MARGIN } from '../constants';
import { CURVE_CLOSED_ADDITIONAL_COORDINATES, CURVE_COORDINATES_DESC, CURVE_COORDINATES_ASC } from '../constants/curve-data';

export class DonutChart {
  constructor(svgGroup, data, index) {
    const donutChartWithTextGroup = this.createDonutChartWithTextGroup(svgGroup, index);
    const donutChartGroup = this.createDonutChart(donutChartWithTextGroup, data.values);
    const firstValuePercentage = this.calculatePercentage(data.values, 0);

    this.addDonutLines(donutChartGroup);
    this.addCurve(donutChartGroup, data.values[0].color, firstValuePercentage >= 50);
    this.addTitle(donutChartGroup, data.info.title);
    this.addTotal(donutChartGroup, data);
    this.addTexts(donutChartWithTextGroup, data.values);
    this.addBottomLine(donutChartWithTextGroup);
  }

  createDonutChartWithTextGroup(svgGroup, index) {
    return svgGroup.append('g')
      .attr('transform', `translate(${(WIDTH + MARGIN) * index}, ${PIE_RADIUS * 3 / 2})`);
  }

  createDonutChart(group, values) {
    const reversedValues = [...values].reverse();

    const g = group.append('g')
      .attr('transform', `translate(${WIDTH / 2}, 0)`);

    const arc = d3.arc()
      .outerRadius(PIE_RADIUS)
      .innerRadius(PIE_RADIUS - DONUT_STROKE_SIZE);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    g.selectAll('.arc')
      .data(pie(reversedValues))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .append('path')
      .attr('d', arc)
      .style('fill', d => d.data.color);

    return g;
  }

  addDonutLine(group, angle) {
    const originY = -PIE_RADIUS + DONUT_STROKE_SIZE + 3;
    const donutLine = group.append('path')
      .attr('class', 'donutLine')
      .attr('d', `M0,${originY} L0,${originY + DONUT_LINE_LENGTH}`)
      .attr('stroke', 'black');

    if (angle)  {
      donutLine.attr('transform', `rotate(${angle})`);
    }
  }

  addDonutLines(group) {
    this.addDonutLine(group);
    this.addDonutLine(group, 90);
    this.addDonutLine(group, 180);
    this.addDonutLine(group, 270);
  }

  addCurve(group, color, isAsc) {
    const curveData = isAsc ? CURVE_COORDINATES_ASC : CURVE_COORDINATES_DESC;
    const curveClosedData = [
      ...curveData,
      ...CURVE_CLOSED_ADDITIONAL_COORDINATES
    ];

    const curve = d3.line()
      .x(d => d.x)
      .y(d => d.y).curve(d3.curveBasis);
    const curveClosed = d3.line()
      .x(d => d.x)
      .y(d => d.y).curve(d3.curveBasisClosed);

    group.append("path")
      .attr('transform', `translate(${-PIE_RADIUS * 2 / 3}, ${PIE_RADIUS / 2})`)
      .attr("d", curveClosed(curveClosedData))
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("fill", color)
      .attr('opacity', 0.1);
      
    group.append("path")
      .attr('transform', `translate(${-PIE_RADIUS * 2 / 3}, ${PIE_RADIUS / 2})`)
      .attr("d", curve(curveData))
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("fill", 'none');
  }

  addTitle(donutChartGroup, title) {
    donutChartGroup.append('text')
      .attr('class', 'title')
      .attr('y', '-30')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '35px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('fill', GREY)
      .text(title);
  }

  calculateTotal(values) {
    return values.map(value => value.value).reduce((acc, value) => acc + value, 0);
  }

  formatNumber(num, unit) {
    if (num) {
      return num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1\.') + (unit || '');
    }

    return null;
  }

  addTotal(donutChartGroup, data) {
    const total = this.calculateTotal(data.values);
    const totalFormatted = this.formatNumber(total, data.info.unit);

    donutChartGroup.append('text')
      .attr('class', 'total')
      .attr('y', '20')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '45px')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .text(totalFormatted);
  }

  calculatePercentage(values, index) {
    const total = this.calculateTotal(values);
    const percentage = Number(values[index].value) / total * 100;

    return Math.round(percentage);
  }

  getLabelTextFromValue(value, x) {
    const anchor = x === 0 ? 'start' : 'end';

    return {
      value: value.label,
      color: value.color,
      x,
      y: PIE_RADIUS + 30,
      anchor,
      fontWeight: 'bold'
    };
  }

  prepareLabelTexts(values) {
    return [
      this.getLabelTextFromValue(values[0], 0),
      this.getLabelTextFromValue(values[1], WIDTH)
    ];
  }

  getTextWidth(text) {
    return text && text.node() ? text.node().getBBox().width : null;
  }

  addTexts(group, values) {
    const labelTexts = this.prepareLabelTexts(values);
    const appendText = text => group.append('text')
      .attr('x', text.x)
      .attr('y', text.y)
      .attr('fill', text.color)
      .attr('text-anchor', text.anchor)
      .attr('font-weight', text.fontWeight)
      .attr('font-size', '30px')
      .text(text.value);
    
    labelTexts.forEach(appendText);

    const [firstValuePercentage, secondValueNumber] = [
      {
        value: `${this.calculatePercentage(values, 0)}%`,
        color: 'black',
        x: 0,
        y: PIE_RADIUS + 70,
        anchor: 'start',
        fontWeight: 'normal'
      },
      {
        value: this.formatNumber(values[1].value),
        color: GREY,
        x: WIDTH,
        y: PIE_RADIUS + 70,
        anchor: 'end',
        fontWeight: 'normal'
      }
    ].map(appendText);

    const firstValuePercentageWidth = this.getTextWidth(firstValuePercentage);
    const secondValueNumberWidth = this.getTextWidth(secondValueNumber);

    [
      {
        value: `${this.calculatePercentage(values, 1)}%`,
        color: 'black',
        x: WIDTH - secondValueNumberWidth - TEXT_MARGIN,
        y: PIE_RADIUS + 70,
        anchor: 'end',
        fontWeight: 'normal'
      },
      {
        value: this.formatNumber(values[0].value),
        color: GREY,
        x: 0 + firstValuePercentageWidth + TEXT_MARGIN,
        y: PIE_RADIUS + 70,
        anchor: 'start',
        fontWeight: 'normal'
      }
    ].forEach(appendText);
  }

  addBottomLine(group) {
    const y = PIE_RADIUS + 100;

    group.append('path')
      .attr('d', `M0,${y} L${WIDTH},${y}`)
      .attr('stroke', GREY);
  }
}
