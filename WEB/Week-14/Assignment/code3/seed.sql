INSERT INTO
    categories (name, slug)
VALUES
    ('Electronics', 'electronics'),
    ('Clothing', 'clothing'),
    ('Books', 'books') ON CONFLICT DO NOTHING;

INSERT INTO
    users (email, name, role)
VALUES
    ('alice@example.com', 'Alice', 'user'),
    ('bob@example.com', 'Bob', 'user'),
    ('charlie@example.com', 'Charlie', 'admin') ON CONFLICT DO NOTHING;

INSERT INTO
    products (name, price, stock, category_id)
VALUES
    (
        'Laptop',
        999.99,
        10,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                slug = 'electronics'
        )
    ),
    (
        'Phone',
        599.99,
        25,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                slug = 'electronics'
        )
    ),
    (
        'Headphones',
        149.99,
        100,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                slug = 'electronics'
        )
    ),
    (
        'T-Shirt',
        29.99,
        200,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                slug = 'clothing'
        )
    ),
    (
        'Running Shoes',
        89.99,
        80,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                slug = 'clothing'
        )
    ),
    (
        'JavaScript Book',
        49.99,
        60,
        (
            SELECT
                id
            FROM
                categories
            WHERE
                slug = 'books'
        )
    ) ON CONFLICT DO NOTHING;