--
-- PostgreSQL database dump
--

\restrict 848qbpmV1Kw7BXiqO2wInkcPwcbyBTYkU6HdzhcOd4UfLqJOhbBqp1pX7bpxlA0

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(30) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    CONSTRAINT accounts_type_check CHECK (((type)::text = ANY ((ARRAY['bank'::character varying, 'cash'::character varying, 'credit_card'::character varying, 'wallet'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_id_seq OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    period character varying(20) NOT NULL,
    start_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT budgets_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT budgets_period_check CHECK (((period)::text = ANY ((ARRAY['monthly'::character varying, 'weekly'::character varying])::text[])))
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.budgets_id_seq OWNER TO postgres;

--
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    user_id bigint,
    name character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categories_type_check CHECK (((type)::text = ANY ((ARRAY['income'::character varying, 'expense'::character varying])::text[])))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    target_amount numeric(12,2) NOT NULL,
    current_amount numeric(12,2) DEFAULT 0,
    deadline date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    target_date date
);


ALTER TABLE public.goals OWNER TO postgres;

--
-- Name: goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goals_id_seq OWNER TO postgres;

--
-- Name: goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.goals_id_seq OWNED BY public.goals.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    account_id bigint NOT NULL,
    category_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    type character varying(20) NOT NULL,
    merchant character varying(255),
    description text,
    transaction_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['income'::character varying, 'expense'::character varying, 'transfer'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, user_id, name, type, created_at, balance) FROM stdin;
8	4	SBI	wallet	2026-08-21 14:45:54.599631	533000.00
7	4	HDFC	bank	2026-08-20 18:20:27.509295	13257540.00
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budgets (id, user_id, category_id, amount, period, start_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, user_id, name, type, created_at) FROM stdin;
1	\N	Food	expense	2026-08-19 06:27:39.678013
2	\N	Transport	expense	2026-08-19 06:27:39.678013
3	\N	Shopping	expense	2026-08-19 06:27:39.678013
4	\N	Bills	expense	2026-08-19 06:27:39.678013
5	\N	Entertainment	expense	2026-08-19 06:27:39.678013
6	\N	Healthcare	expense	2026-08-19 06:27:39.678013
7	\N	Education	expense	2026-08-19 06:27:39.678013
8	\N	Travel	expense	2026-08-19 06:27:39.678013
9	\N	Subscriptions	expense	2026-08-19 06:27:39.678013
10	\N	Other	expense	2026-08-19 06:27:39.678013
11	\N	Salary	income	2026-08-19 06:27:39.678013
12	\N	Other Income	income	2026-08-19 06:27:39.678013
13	4	Gromming	expense	2026-08-21 21:14:47.940656
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goals (id, user_id, name, target_amount, current_amount, deadline, created_at, updated_at, target_date) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
2	3	6f35083349eca90d6a6f918435752cdbdee710432c3ea3e44b8212485d8d35d8b1dc0d1035a84c90a436f9ee27dac9e04bf29e718837071b074e529f7f283aa6	2026-08-27 16:56:17.473	2026-08-20 16:56:17.476995
3	3	0f36338ed9207c45a7428f96505490afe33c47dc4b22625a043bdad63d6bccfefdcce2c7c769fb5b4935d3172252f62e13ec48669f47db8464e2607474fafa9d	2026-08-27 16:57:02.343	2026-08-20 16:57:02.346052
4	4	7e47e46d0a661f1ad9f301cf4851f82708bbd4e70c44fb876db3fd08b9e50095633896336e1bb3122feeaf5905d0dede28b5c0a5ec06e8060ea487ebeab6c035	2026-08-27 17:07:13.923	2026-08-20 17:07:13.925085
5	4	5c929ac408d8b920e7744eb70d053a71b9226770bd617a9767eba884181b467f13f3e559cb551ba2f5df688fbfd6bbababf5a500dd2bb8080dbe358420022e2b	2026-08-27 17:19:59.859	2026-08-20 17:19:59.862093
6	4	5f357f42627eb8280e12e54dade1fb7846187a04829f20a69f978316f28b1aa94e28cec65d05b9a0d7545d5ce85c15226e75893def936be3724dd92a3c0f70bb	2026-08-27 18:05:51.799	2026-08-20 18:05:51.827286
7	4	b8f02a806e486dbb2675831969dab10c72db4828abd39cd2f41c6fc94ce3593bf4b34c8413d297aa81d4baf9aeec16f0cd036a5cc70382a4e16fb85562d869de	2026-08-28 14:45:25.985	2026-08-21 14:45:25.995026
8	4	fcc33b9d99e27fffb2ef06c1040660ce66fb1a808c105e562ef0f4e89cbda12ef17210d70ed7c18edde0653f8238b6a8741c5b8d2fcfdbbc6a5c5311f2d06c49	2026-08-28 15:24:43.424	2026-08-21 15:24:43.429107
9	4	3a9d13c2301a972944e75e9d8de2c7d592c44dfc9d8a33ffcf5f1c83d46785e6b7619833ec538f896564fcece52a996fab1fa7168cf205e9ae3a2c47df9001c7	2026-08-28 15:40:36.887	2026-08-21 15:40:36.890521
10	4	236ba1d7bfe749719774fb70aabfdb5061919c1d41e13458ec62ec29796c3d8ad5a4a190b15b570c34d441ae821bd8d9e2d0c3765a69ff6f89274a47a700f939	2026-08-28 16:00:30.47	2026-08-21 16:00:30.475796
11	4	3219617e044f93eeb352123e4439ebbb7c20ca18e30848de4d2ba1d2f85bb0401322c96aebf23785f0018d9beb010b5bd61ed522ba0153d2f9dcc7a23377ea1f	2026-08-28 16:25:10.24	2026-08-21 16:25:10.244249
12	4	d72ba91c338cf63058dbaec067a4b0180b6e7b7189a71837843f94a5f98d22d7c508474c8ab4c07c0636bafde070bf97ad89c89b470e843ed3ce6b74821ac112	2026-08-28 20:00:38.744	2026-08-21 20:00:38.793649
13	4	b75365ff0fd80dc2835ddd0e02627f3c901d103e3b68f8db0aa9738745a25d0cea3240e88b6c3407f9fca9cae36f12ece753d057c8888aa2600ebb67e4869e08	2026-08-28 20:47:38.496	2026-08-21 20:47:38.501672
14	4	eb3329f4ebf17543d32f48015c945081115a87e8091c3e5bf1d16a089ca3f9e30c37ab807710bdd7a83ded688a9658a034e0d8a792d2b881334af2a22e8bae74	2026-08-28 21:14:05.052	2026-08-21 21:14:05.056224
15	4	f4d12fad83273f56dfe0d93c7160833a75c9b522be36bf71b2823a3715bdf71f09e1c621dd82b1214d0f982ed6227440ebedc17660d812c6ca4f4e3c64bda66e	2026-08-28 21:45:48.318	2026-08-21 21:45:48.375355
16	4	27b63f533397ee1a2b34af03017422d152c71572e8bbebba1ba331e397ebc3c505c7403534a6a7126471258dc5f1cc3a010925582db60e6920ea52133055fdac	2026-08-28 23:22:55.607	2026-08-21 23:22:55.61052
17	4	d533af74a72b08fe1ede38415afd632cf0ee1233bfb06be7d8da227cd238f399c171065d8ddaaa0129e1f17abd63d5c2a748b00ceae9407c69d78440efd4418b	2026-08-28 23:28:14.925	2026-08-21 23:28:14.927645
18	4	41adfd75c9997c87a0c2ec33029ec1bc81f2ba690191a84425492ff257fed8d02986591251949e0c7f335378d1c03019a291901e9b3bc5ef9ca711b23c5ffb9b	2026-08-29 00:00:53.647	2026-08-22 00:00:53.720564
19	4	ace5687c65efa598a6f18f99a931b3fc1c9bfdfef719372bc37dd3117c3ed4560bdf8447ec445234a484b6c88f75bd3914a02a3801bbea80bc3aab182ab33d23	2026-08-29 01:31:20.526	2026-08-22 01:31:20.530152
20	4	42f9a452bcee4bf8443a1239dcb715d03d0667dca7b82c20e1f63f1e9388be1c968ad70103c154a7c6fab16713cb517e179398f57088d469347ecdb331f4dc9f	2026-08-29 01:48:26.909	2026-08-22 01:48:26.915112
21	4	bc52c458c894fae487ca0aa3583e76895af4ac6d326e4cb8db11bf502c88117a70e1768e2af813fde139c0ef9c1df37fa11a9d27cf4b481c8d8338bd7cc7ac59	2026-08-29 09:25:01.948	2026-08-22 09:25:01.952692
22	4	b04fa1b1b0bcb8b6c2c0ba6efe841dcc60498e25364ffa59651a31dcabab9c4c7eaee6e8c27686ecb26776539030b1296ce40e72a4e6e74e18ac0b976ea868c3	2026-08-29 09:26:01.038	2026-08-22 09:26:01.039902
23	5	331b5817e4964ba2addbbd5436c3f2a0eca0af6030b3f6d4af7ade60acce7d779bfb0afa0c27cbf87ddae18b1fc4c0538cd0e60d295841244e7c664b9a73d141	2026-08-29 09:27:47.013	2026-08-22 09:27:47.01476
24	4	7a61de4d68b7c2bac45665668310f50b3fc47678615cb21a1819a76af329b3c62201279cd559bae77a8c54bba567d7a71e75079a6149f02ad61de90a08c87937	2026-08-29 09:44:36.644	2026-08-22 09:44:36.648244
25	4	8f16d63b9879996478f797cb0b53f65f331f18b49a9aeeb483b59817be78d4af7dcc6b58365d5897c03930ebe4e4bc8ecb1cc948b4fccf95373505a7279c9b9e	2026-08-29 10:00:11.169	2026-08-22 10:00:11.178592
26	4	243d005e243e0de7cc3ea950a8cb991756bbd3a357d12c4fc1763713e7a743da01fb644cd4c14eed1915a9f2e3d0b82c7a58204a3707622d950759b11bcdf658	2026-08-29 05:21:06.406	2026-08-22 10:51:06.408964
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, account_id, category_id, amount, type, merchant, description, transaction_date, created_at, updated_at) FROM stdin;
1	4	8	4	10000.00	expense	\N	goods	2026-08-01	2026-08-21 16:00:57.680593	2026-08-21 16:00:57.680593
3	4	7	11	12000000.00	income	\N	salary	2026-06-04	2026-08-21 16:26:34.846473	2026-08-21 16:26:34.846473
4	4	8	3	7000.00	expense	\N	Clothes	2026-03-07	2026-08-21 16:30:35.552671	2026-08-21 16:30:35.552671
2	4	7	3	23000.00	income	\N	gadgets	2026-08-06	2026-08-21 16:01:32.64399	2026-08-21 16:01:32.64399
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, created_at, updated_at) FROM stdin;
1	Akbar	akbar@example.com	$2b$12$j6w4VnDt1IdB6Ys19QsPYe5gUtjyzVopMVFMqTLOCIWEqqriQYkyu	2026-08-18 23:30:05.516397	2026-08-18 23:30:05.516397
2	user1	user1@gmail.com	$2b$12$RRV0mFIBhdOgH4Q1IDeOBe3TqHn/GJYH0SuwRCrqIDrEcr7qeJpnm	2026-08-18 23:30:36.344772	2026-08-18 23:30:36.344772
3	Akbar	akbar@gmail.com	$2b$12$2tmFgmvBbOmdsUArATvdOeI/Wj/olVLc.m1VyBY/izHxJLzJeUF5i	2026-08-20 16:54:54.440195	2026-08-20 16:54:54.440195
4	user	user@gmail.com	$2b$12$dkCJKO3v0p1fVp4QnVmVMuQ8FTlu0y.IsyQhv1WAIWFQW3Mp40/ke	2026-08-20 17:07:02.415805	2026-08-20 17:07:02.415805
5	user2	user2@gmail.com	$2b$12$0DPoDEbfnJo7E3AWynQHu.DqqphP4jsa0twtG/ldW5zLhw6hqzRxy	2026-08-22 09:27:28.957823	2026-08-22 09:27:28.957823
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 8, true);


--
-- Name: budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.budgets_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 13, true);


--
-- Name: goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.goals_id_seq', 1, false);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 26, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_transactions_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_date ON public.transactions USING btree (transaction_date);


--
-- Name: idx_transactions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);


--
-- Name: unique_user_category_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_category_name ON public.categories USING btree (user_id, lower((name)::text));


--
-- Name: budgets budgets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: budgets budgets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: accounts fk_accounts_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories fk_categories_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens fk_refresh_tokens_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions fk_transactions_account; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: transactions fk_transactions_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: transactions fk_transactions_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 848qbpmV1Kw7BXiqO2wInkcPwcbyBTYkU6HdzhcOd4UfLqJOhbBqp1pX7bpxlA0

