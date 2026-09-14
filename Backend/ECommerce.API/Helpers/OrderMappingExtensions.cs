using System;
using System.Linq;
using ECommerce.API.Models;
using ECommerce.API.DTOs.Customer;

namespace ECommerce.API.Helpers
{
    public static class OrderMappingExtensions
    {
        public static OrderResponseDto ToCustomerOrderResponseDto(this Order order)
        {
            if (order == null) throw new ArgumentNullException(nameof(order));

            return new OrderResponseDto
            {
                OrderId = order.Id,
                OrderDate = order.CreatedAt,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                ShippingAddress = order.ShippingAddress ?? string.Empty,
                PaymentMethod = order.PaymentMethodType ?? order.PaymentMethod?.Name ?? string.Empty,
                TrackingNumber = order.Shipping?.TrackingNumber,
                Items = order.OrderItems != null
                    ? order.OrderItems.Select(i => new OrderItemResponseDto
                    {
                        ProductId = i.ProductId,
                        ProductName = i.Product?.Name ?? string.Empty,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice
                    }).ToList()
                    : new System.Collections.Generic.List<OrderItemResponseDto>()
            };
        }

        public static OrderStatus ParseOrderStatus(string statusString)
        {
            if (Enum.TryParse<OrderStatusEnum>(statusString, ignoreCase: true, out var result))
            {
                return new OrderStatus(result);
            }
            return OrderStatus.Pending;
        }

        public static string ToStatusString(this OrderStatus status) => status.ToString();
        public static OrderStatus ToOrderStatus(this string statusString) => ParseOrderStatus(statusString);
    }
}
