<script setup>
import { formatPrice } from '@/utils/formatters'

defineProps({
  totalCount: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['go-to-cart'])
</script>

<template>
  <header class="site-header">
    <div class="container nav-container">
      <div class="logo-group">
        <span class="logo">🚀 КосмоСвіт Store</span>
        <span class="logo-subtitle">Постери · 3D-моделі · Сувеніри</span>
      </div>

      <button
        type="button"
        class="header-cart-btn"
        aria-label="Перейти до кошика"
        @click="emit('go-to-cart')"
      >
        <span>🛒 Кошик</span>
        <span class="cart-badge">{{ totalCount }}</span>
        <span class="header-total">{{ formatPrice(totalPrice) }}</span>
      </button>
    </div>
  </header>
</template>
