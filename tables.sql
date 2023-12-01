create table user( 
    id int primary key AUTO_INCREMENT, 
    name varchar(250),
    password varchar(250),
    email varchar(50),
    role varchar(50),
    UNIQUE(email)
);

create table refreshToken(
    id int primary key AUTO_INCREMENT,
    expiresIn int,
    userName varchar(250),
    userId int NOT NULL
);


create table articles(
    id int NOT NULL AUTO_INCREMENT,
    userId int NOT NULL,
    title varchar(250) NOT NULL,
    image varchar(250) DEFAULT NULL,
    content varchar(250) NOT NULL,
    primary key(id)
);

-- create a user  to test
insert into user(name, password, email, role) values ('admin','admin','admin@admin.com','admin');




