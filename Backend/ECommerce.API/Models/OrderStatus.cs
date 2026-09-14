using System;

namespace ECommerce.API.Models
{
    public enum OrderStatusEnum
    {
        Pending = 1,
        Confirmed = 2,
        Processing = 3,
        Shipped = 4,
        Delivered = 5,
        Cancelled = 6,
        Refunded = 7
    }

    public readonly struct OrderStatus : IEquatable<OrderStatus>
    {
        public OrderStatusEnum Value { get; }

        public OrderStatus(OrderStatusEnum value) => Value = value;
        public OrderStatus(int value) => Value = (OrderStatusEnum)value;

        public static readonly OrderStatus Pending = new(OrderStatusEnum.Pending);
        public static readonly OrderStatus Confirmed = new(OrderStatusEnum.Confirmed);
        public static readonly OrderStatus Processing = new(OrderStatusEnum.Processing);
        public static readonly OrderStatus Shipped = new(OrderStatusEnum.Shipped);
        public static readonly OrderStatus Delivered = new(OrderStatusEnum.Delivered);
        public static readonly OrderStatus Cancelled = new(OrderStatusEnum.Cancelled);
        public static readonly OrderStatus Refunded = new(OrderStatusEnum.Refunded);

        // Implicit conversions to/from string
        public static implicit operator string(OrderStatus status) => status.Value.ToString();
        public static implicit operator OrderStatus(string? statusStr)
        {
            if (Enum.TryParse<OrderStatusEnum>(statusStr, true, out var result))
                return new OrderStatus(result);
            return Pending;
        }

        // Implicit conversions to/from OrderStatusEnum
        public static implicit operator OrderStatusEnum(OrderStatus status) => status.Value;
        public static implicit operator OrderStatus(OrderStatusEnum statusEnum) => new OrderStatus(statusEnum);

        // Implicit conversions to/from int
        public static implicit operator int(OrderStatus status) => (int)status.Value;
        public static implicit operator OrderStatus(int val) => new OrderStatus((OrderStatusEnum)val);

        public override string ToString() => Value.ToString();
        public bool Equals(OrderStatus other) => Value == other.Value;
        public override bool Equals(object? obj) => obj is OrderStatus other && Equals(other);
        public override int GetHashCode() => Value.GetHashCode();
        public static bool operator ==(OrderStatus left, OrderStatus right) => left.Equals(right);
        public static bool operator !=(OrderStatus left, OrderStatus right) => !left.Equals(right);
    }
}