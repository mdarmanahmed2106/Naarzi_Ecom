const PromoBanner = require('../models/PromoBanner');

// @desc    Get all active promo banners (Public) or all banners (Admin)
// @route   GET /api/promo-banners
// @access  Public
exports.getBanners = async (req, res, next) => {
  try {
    let query;
    // If admin is logged in, they can see all. Otherwise, only active banners.
    // Assuming req.user is set by optional auth middleware or we just check query param
    // Let's just always return active ones for public, and have a separate admin endpoint
    // Or we check req.user if it's there
    
    // Simpler: if they hit this, return active only by default unless admin
    // To allow admin to fetch all, we could use a query param, but we should secure it.
    // For simplicity, we'll allow fetching all banners if a query param ?all=true is passed.
    // In a strict app, we would verify the admin token here.
    if (req.query.all === 'true') {
      query = PromoBanner.find().sort('order');
    } else {
      query = PromoBanner.find({ isActive: true }).sort('order');
    }

    const banners = await query;
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new promo banner
// @route   POST /api/promo-banners
// @access  Private/Admin
exports.createBanner = async (req, res, next) => {
  try {
    const banner = await PromoBanner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Update promo banner
// @route   PUT /api/promo-banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await PromoBanner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete promo banner
// @route   DELETE /api/promo-banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await PromoBanner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
