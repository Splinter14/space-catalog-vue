<script setup>
import { formatPrice, resolveAsset } from '@/utils/formatters'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['increment', 'decrement', 'remove'])
</script>

<template>
  <div class="cart-item">
    <img
      :src="resolveAsset(props.item.image)"
      :alt="props.item.name"
      class="cart-item-img"
    />

    <div class="cart-item-info">
      <div class="cart-item-title">{{ props.item.name }}</div>
      <div class="cart-item-meta">
        {{ formatPrice(props.item.price) }} / шт.
      </div>

      <div class="cart-item-controls">
        <div class="qty-group">
          <button
            type="button"
            class="qty-btn"
            aria-label="Зменшити кількість"
            @click="emit('decrement', props.item.id)"
          >
            −
          </button>
          <span class="qty-value">{{ props.item.quantity }}</span>
          <button
            type="button"
            class="qty-btn"
            aria-label="Збільшити кількість"
            @click="emit('increment', props.item.id)"
          >
            +
          </button>
        </div>

        <span class="cart-item-subtotal">
          {{ formatPrice(props.item.price * props.item.quantity) }}
        </span>
      </div>
    </div>

    <button
      type="button"
      class="cart-remove-btn"
      aria-label="Видалити позицію з кошика"
      title="Видалити"
      @click="emit('remove', props.item.id)"
    >
      ✕
    </button>
  </div>
</template>
