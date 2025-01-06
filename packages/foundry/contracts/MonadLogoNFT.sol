// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IERC4906 {
    event MetadataUpdate(uint256 _tokenId);
}

/**
 * @title MonadLogoNFT
 * @dev Contract for the Monad Logos NFT collection, featuring unique colored logos
 * @notice This contract allows users to mint NFTs with unique color combinations
 */
contract MonadLogoNFT is ERC721, ERC721Enumerable, ERC721Burnable, Ownable, ReentrancyGuard, Pausable, IERC4906 {
    using Strings for uint256;

    uint256 public currentTokenId;
    uint256 private _currentSupply;

    bool public mintEnabled;

    mapping(uint256 => string) public tokenColors;
    mapping(bytes32 => bool) private _existingCombinations;
    mapping(string => bool) private _usedColors;


    event TokenMinted(address indexed to, uint256 indexed tokenId, string color);

    event MintingToggled(bool newStatus);

    /**
     * @dev Contract constructor
     * @notice Initializes the Monad Logos NFT collection with minting disabled
     */
    constructor() ERC721("Monad Logos", "LOGOS") Ownable(msg.sender) {
        currentTokenId = 0;
        mintEnabled = false;
        _currentSupply = 0;
    }

    /**
     * @dev Mints a new Monad Logo NFT with a specific color
     * @param color The hex color code for the logo (format: #RRGGBB)
     * @notice Allows users to mint an NFT with their chosen color if it hasn't been used
     * @notice Requires minting to be enabled and supply to be below maximum
     */
    function mint(string memory color) external whenNotPaused nonReentrant {
        require(mintEnabled, "Mint not started");

        uint256 newTokenId = currentTokenId;
        
        // Convert color to uppercase
        string memory upperColor = toUpper(color);
        
        require(!_usedColors[upperColor], "Color already used");
        require(isValidHexCode(upperColor), "Invalid color hex code");

        _usedColors[upperColor] = true;
        tokenColors[newTokenId] = upperColor;

        _safeMint(msg.sender, newTokenId);

        currentTokenId++;
        _currentSupply++;
        emit TokenMinted(msg.sender, newTokenId, upperColor);
        emit MetadataUpdate(newTokenId);
    }

    /**
     * @dev Converts a hex color string to uppercase
     * @param str The color string to convert
     * @return The uppercase version of the color string
     */
    function toUpper(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bUpper = new bytes(bStr.length);
        
        for (uint i = 0; i < bStr.length; i++) {
            // Convert only if character is lowercase a-f
            if (bStr[i] >= 0x61 && bStr[i] <= 0x66) {
                bUpper[i] = bytes1(uint8(bStr[i]) - 32);
            } else {
                bUpper[i] = bStr[i];
            }
        }
        
        return string(bUpper);
    }

    /**
     * @dev Burns a Monad Logo NFT
     * @param tokenId The ID of the token to burn
     * @notice Allows token owners to burn their NFTs and decrease the total supply
     */
    function burn(uint256 tokenId) public override {
        super.burn(tokenId);
        _currentSupply--;
    }


    /**
     * @dev Generates the token URI containing metadata and SVG image
     * @param tokenId The ID of the token
     * @return The complete token URI as a base64 encoded JSON string
     * @notice Returns the on-chain metadata and SVG image for a specific token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        string memory image = buildSVG(tokenId);
        string memory base64Image = Base64.encode(bytes(image));

        string memory json = string(
            abi.encodePacked(
                '{"name":"Monad Logo #',
                tokenId.toString(),
                '","description":"Colorful onchain Monad logos","attributes":[',
                _getMetadata(tokenId),
                '],"image":"data:image/svg+xml;base64,',
                base64Image,
                '"}'
            )
        );

        string memory base64Json = Base64.encode(bytes(json));
        return string(abi.encodePacked("data:application/json;base64,", base64Json));
    }

    /**
     * @dev Generates the SVG image for a token
     * @param tokenId The ID of the token
     * @return The SVG image as a string
     * @notice Creates the visual representation of the Monad Logo with its unique color
     */
    function buildSVG(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        string memory color = tokenColors[tokenId];
        
        return string(abi.encodePacked(
            '<svg width="640" height="640" viewBox="-2 -2 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '<path d="M15.9999 0C11.3795 0 0 11.3792 0 15.9999C0 20.6206 11.3795 32 15.9999 32C20.6203 32 32 20.6204 32 15.9999C32 11.3794 20.6205 0 15.9999 0ZM13.5066 25.1492C11.5582 24.6183 6.31981 15.455 6.85083 13.5066C7.38185 11.5581 16.545 6.31979 18.4933 6.8508C20.4418 7.38173 25.6802 16.5449 25.1492 18.4934C24.6182 20.4418 15.455 25.6802 13.5066 25.1492Z" fill="',
            color,
            '"/>',
            '</svg>'
        ));
    }

    /**
     * @dev Generates metadata for a given token ID
     * @param tokenId The ID of the token
     * @return string The metadata as a JSON string
     */
    function _getMetadata(uint256 tokenId) internal view returns (string memory) {
        string memory color = tokenColors[tokenId];
        
        return string(
            abi.encodePacked(
                '{"trait_type":"Color","value":"',
                color,
                '"}'
            )
        );
    }

    /**
     * @dev Toggles the minting status of the contract
     * @notice Can only be called by the contract owner to enable or disable minting
     * @notice Emits a MintingToggled event
     */
    function toggleMinting() external onlyOwner {
        mintEnabled = !mintEnabled;
        emit MintingToggled(mintEnabled);
    }

    /**
     * @dev Returns the current total supply of Monad Logos
     * @return The current number of tokens in circulation
     */
    function currentSupply() public view returns (uint256) {
        return _currentSupply;
    }

    /**
     * @dev Pauses all token transfers and minting
     * @notice Can only be called by the contract owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers and minting
     * @notice Can only be called by the contract owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Validates a hex color code format
     * @param hexCode The color code to validate
     * @return bool indicating if the color code is valid
     * @notice Checks if the provided string matches the format #RRGGBB
     */
    function isValidHexCode(string memory hexCode) public pure returns (bool) {
        bytes memory b = bytes(hexCode);
        if (b.length != 7 || b[0] != '#') return false;
        for (uint256 i = 1; i < 7; i++) {
            bytes1 char = b[i];
            if (!(char >= '0' && char <= '9') &&
                !(char >= 'a' && char <= 'f') &&
                !(char >= 'A' && char <= 'F')) {
                return false;
            }
        }
        return true;
    }

    function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Mints a new Monad Logo NFT with a random color
     * @notice Allows users to mint an NFT with a randomly generated color
     * @notice Will attempt to find an unused color up to 50 times
     */
    function mintRandom() external whenNotPaused nonReentrant {
        require(mintEnabled, "Mint not started");

        uint256 newTokenId = currentTokenId;
        
        // Generate random colors until we find an unused one
        string memory color;
        bool found = false;
        uint256 attempts = 0;
        uint256 maxAttempts = 50; // Prevent infinite loops
        
        while (!found && attempts < maxAttempts) {
            // Generate random hex color
            color = generateRandomColor();
            if (!_usedColors[color]) {
                found = true;
            }
            attempts++;
        }
        
        require(found, "No unused colors available");
        require(isValidHexCode(color), "Invalid color hex code");

        _usedColors[color] = true;
        tokenColors[newTokenId] = color;

        _safeMint(msg.sender, newTokenId);

        currentTokenId++;
        _currentSupply++;
        emit TokenMinted(msg.sender, newTokenId, color);
        emit MetadataUpdate(newTokenId);
    }

    /**
     * @dev Generates a random color in hex format
     * @return A random color code in the format #RRGGBB
     * @notice Uses block information and sender address for randomness
     */
    function generateRandomColor() internal view returns (string memory) {
        bytes memory characters = "0123456789ABCDEF";
        bytes memory color = new bytes(7);
        color[0] = '#';
        
        // Use block information and msg.sender for randomness
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _currentSupply
        )));
        
        // Generate 6 random hex characters
        for (uint256 i = 0; i < 6; i++) {
            uint8 random = uint8((randomness >> (i * 8)) & 0xFF);
            color[i + 1] = characters[random % 16];
        }
        
        return string(color);
    }
}
