ALTER TABLE reviews
ADD CONSTRAINT reviews_pull_request_id_unique UNIQUE (pull_request_id);