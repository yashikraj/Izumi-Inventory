DELIMITER //

CREATE PROCEDURE add_new_product(
    IN p_item_name VARCHAR(255),
    IN p_category VARCHAR(100),
    IN p_quantity INT,
    IN p_unit_price DECIMAL(10, 2),
    IN p_storage_location VARCHAR(100),
    IN p_description TEXT
)
BEGIN
    -- Insert the new product
    INSERT INTO items (item_name, category, quantity, unit_price, storage_location, description)
    VALUES (p_item_name, p_category, p_quantity, p_unit_price, p_storage_location, p_description);
    
    -- Get the ID of the newly inserted product
    SET @new_item_id = LAST_INSERT_ID();
    
    -- Log the stock addition
    INSERT INTO stock_logs (item_id, user_id, action_type, quantity_changed)
    VALUES (@new_item_id, 1, 'added', p_quantity);
    
    -- Return the new item ID
    SELECT @new_item_id AS new_item_id;
END //

DELIMITER ;