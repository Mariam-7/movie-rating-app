<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  ratings: {
    type: Array,
    required: true
  }
})

const counts = Array(10).fill(0)
props.ratings.forEach(rating => {
  if (rating >= 1 && rating <= 10) {
    counts[rating - 1]++
  }
})

const total = counts.reduce((sum, c) => sum + c, 0)
const percentages = counts.map(count => total > 0 ? Math.round((count / total) * 100) : 0)

const chartData = {
  labels: ['1★', '2★', '3★', '4★', '5★', '6★', '7★', '8★', '9★', '10★'],
  datasets: [
    {
      label: 'Rating Distribution (%)',
      data: percentages,
      backgroundColor: '#0077ff'
    }
  ]
}

const chartOptions = {
  responsive: true,
  scales: {
    y: {
      min: 0,
      max: 100,
      title: {
        display: true,
        text: 'Percentage'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Rating (Stars)'
      }
    }
  }
}
</script>
