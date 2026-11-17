<script setup>
import { formatPrice, resolveAsset } from '@/utils/formatters'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  cartQuantity: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['add-to-cart'])

function handleAdd() {
  emit('add-to-cart', props.product)
}
</script>

<template>
  <article class="product-card">
    <div class="product-media">
      <img
        :src="resolveAsset(product.image)"
        :alt="product.name"
        loading="lazy"
      />
      <span v-if="product.badge" class="product-badge">{{ product.badge }}</span>
    </div>

    <div class="product-body">
      <span class="card-tag">{{ product.category }}</span>
      <h3 class="product-title">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <p class="product-spec">{{ product.spec }}</p>

      <div class="product-footer">
        <span class="product-price">{{ formatPrice(product.price) }}</span>
        <button
          type="button"
          class="btn"
          @click="handleAdd"
        >
          {{ cartQuantity > 0 ? `У кошику (${cartQuantity}) · +1` : 'Додати в кошик' }}
        </button>
      </div>
    </div>
  </article>
</template>
