namespace ECommerce.API.DTOs.Customer
{
    // Product-level rating aggregate returned alongside reviews.
    public class RatingSummaryDto
    {
        public int ProductId { get; set; }

        public double AverageRating { get; set; }

        public int ReviewCount { get; set; }

        public int FiveStar { get; set; }

        public int FourStar { get; set; }

        public int ThreeStar { get; set; }

        public int TwoStar { get; set; }

        public int OneStar { get; set; }
    }
}
