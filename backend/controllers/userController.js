import User from '../models/User.js';

// @desc    Add a country to favorites
// @route   POST /api/users/favorites
// @access  Private
export const addFavorite = async (req, res) => {
  try {
    console.log('⭐ Add Favorite Request Body:', req.body);
    console.log('⭐ User ID:', req.user._id);
    
    const { countryCode } = req.body;

    console.log('⭐ Country Code extracted:', countryCode);

    if (!countryCode) {
      console.log('❌ Error: Country code is missing in request');
      return res.status(400).json({
        success: false,
        message: 'Country code is required',
      });
    }

    // Find the user
    const user = await User.findById(req.user._id);
    console.log('⭐ User found:', user.name, user.email);
    console.log('⭐ Current favorites:', user.favoriteCountries);

    // Check if country is already in favorites
    if (user.favoriteCountries.includes(countryCode)) {
      console.log('❌ Country already in favorites');
      return res.status(400).json({
        success: false,
        message: 'Country is already in favorites',
      });
    }

    // Use findByIdAndUpdate instead of save() to avoid validation issues
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { favoriteCountries: countryCode } },
      { new: true, runValidators: false }
    );

    console.log('✅ Updated favorites:', updatedUser.favoriteCountries);

    res.status(200).json({
      success: true,
      message: 'Country added to favorites',
      favoriteCountries: updatedUser.favoriteCountries,
    });
  } catch (error) {
    console.error('❌ Add Favorite Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove a country from favorites
// @route   DELETE /api/users/favorites/:countryCode
// @access  Private
export const removeFavorite = async (req, res) => {
  try {
    const { countryCode } = req.params;
    console.log('⭐ Removing country from favorites:', countryCode);
    console.log('⭐ User ID:', req.user._id);

    const user = await User.findById(req.user._id);
    console.log('⭐ User found:', user.name, user.email);
    console.log('⭐ Current favorites:', user.favoriteCountries);

    // Check if country is in favorites
    if (!user.favoriteCountries.includes(countryCode)) {
      console.log('❌ Country not in favorites');
      return res.status(400).json({
        success: false,
        message: 'Country is not in favorites',
      });
    }

    // Use findByIdAndUpdate instead of save() to avoid validation issues
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favoriteCountries: countryCode } },
      { new: true, runValidators: false }
    );

    console.log('✅ Updated favorites after removal:', updatedUser.favoriteCountries);

    res.status(200).json({
      success: true,
      message: 'Country removed from favorites',
      favoriteCountries: updatedUser.favoriteCountries,
    });
  } catch (error) {
    console.error('❌ Remove Favorite Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's favorite countries
// @route   GET /api/users/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      favoriteCountries: user.favoriteCountries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check if a country is in user's favorites
// @route   GET /api/users/favorites/check/:countryCode
// @access  Private
export const checkFavorite = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const user = await User.findById(req.user._id);

    const isFavorite = user.favoriteCountries.includes(countryCode);

    res.status(200).json({
      success: true,
      isFavorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 