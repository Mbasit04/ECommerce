using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Customer
{
    // Edit payload for an existing review. Re-uses the same validation rules
    // as CreateFeedbackDto (rating 1..5, non-empty comment up to 1000 chars).
    public class UpdateFeedbackDto
    {
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [StringLength(1000)]
        public string Comment { get; set; } = string.Empty;
    }
}
