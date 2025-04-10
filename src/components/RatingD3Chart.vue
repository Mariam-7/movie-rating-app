<template>
  <div ref="chart" class="d3-chart"></div>
</template>

<script setup>
import * as d3 from 'd3'
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'

const props = defineProps({
  ratings: {
    type: Array,
    required: true
  }
})

const chart = ref(null)
let svg = null

const drawChart = () => {
  const data = Array(10).fill(0)
  props.ratings.forEach(r => {
    if (r >= 1 && r <= 10) data[r - 1]++
  })

  const total = data.reduce((a, b) => a + b, 0)
  const percentages = data.map(c => total > 0 ? Math.round((c / total) * 100) : 0)

  const width = 700
  const height = 400
  const margin = { top: 40, right: 20, bottom: 50, left: 50 }

  d3.select(chart.value).selectAll('*').remove()
  svg = d3.select(chart.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // Title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top - 20)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '18px')
    .text('Rating Distribution (%)')

  const x = d3.scaleBand()
    .domain(d3.range(1, 11).map(d => d.toString()))
    .range([margin.left, width - margin.right])
    .padding(0.2)

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top])

  // X axis
  svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.selectAll('text').attr('fill', 'white'))
    .append('text')
    .attr('x', width / 2)
    .attr('y', 35)
    .attr('fill', 'white')
    .attr('text-anchor', 'middle')
    .text('Rating (Stars)')

  // Y axis
  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    .call(g => g.selectAll('text').attr('fill', 'white'))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -35)
    .attr('fill', 'white')
    .attr('text-anchor', 'middle')
    .text('Percentage')

  // Bars
  svg.selectAll('rect')
    .data(percentages)
    .enter()    .append('rect')
    .attr('x', (d, i) => x((i + 1).toString()))
    .attr('y', d => y(d))
    .attr('width', x.bandwidth())
    .attr('height', d => height - margin.bottom - y(d))
    .attr('fill', '#0077ff')
}


onMounted(drawChart)
watch(() => props.ratings, drawChart)
onBeforeUnmount(() => {
  d3.select(chart.value).selectAll('*').remove()
})
</script>

<style scoped>
.d3-chart {
  max-width: 100%;
  margin-bottom: 20px;
}
</style>