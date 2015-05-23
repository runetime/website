@extends('layouts.default')
@section('contents')
            <div class='container container-dark'>
                <h1>
                    @lang('about.name')
                </h1>
                <p>
                    @lang('about.b1.p1')
                </p>
            </div>
            <div class='container container-dark'>
                <h3>
                    @lang('about.b1.p2')
                </h3>
                <p>
                    <small>
                        @lang('about.click')
                    </small>
                </p>
                <div class='row'>
                    <div class='col-xs-12 col-sm-4'>
                        <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-ads'>
                            @lang('about.b1.p3')
                        </button>
                    </div>
                    <div class='col-xs-12 col-sm-4'>
                        <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-radio'>
                            @lang('about.b1.p5')
                        </button>
                    </div>
                    <div class='col-xs-12 col-sm-4'>
                        <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-forums'>
                            @lang('about.b1.p7')
                        </button>
                    </div>
                </div>
                <br />
                <div class='row'>
                    <div class='col-xs-12 col-sm-4'>
                        <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-full-disclosure'>
                            @lang('about.b1.p9')
                        </button>
                    </div>
                    <div class='col-xs-12 col-sm-4'>
                        <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-our-members'>
                            @lang('about.b1.p11')
                        </button>
                    </div>
                    <div class='col-xs-12 col-sm-4'>
                        <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-community-openness'>
                            @lang('about.b1.p13')
                        </button>
                    </div>
                </div>
            </div>
            <div class='container container-dark'>
                <h3>
                    @lang('about.b2.name')
                </h3>
                <p>
                    @lang('about.b2.p1')
                </p>
                <img src='/img/about/setup.png' alt='How We Are Setup' class='center-block img-responsive' />
                <p>
                    @lang('about.b2.p2')
                </p>
            </div>
            <div class='container container-dark'>
                <h3>
                    @lang('about.b3.name')
                </h3>
                <p>
                    @lang('about.b3.p1')
                </p>
                <p>
                    @lang('about.b3.p2')
                </p>
                <p>
                    @lang('about.b3.p3') <a href='http://services.runescape.com/m=rswiki/en/Rules_of_RuneScape' target='_blank' title='Rules of RuneScape'>http://services.runescape.com/m=rswiki/en/Rules_of_RuneScape</a>
                </p>
                <p>
                    @lang('about.b3.p4')
                </p>
            </div>
            <div id='clan-dialog-ads' class='dialog'>
                <div class='dialog__overlay'></div>
                <div class='dialog__content'>
                    <h2>
                        @lang('about.b1.p3')
                    </h2>
                    <p>
                        @lang('about.b1.p4')
                    </p>
                    <div>
                        <button class='action dialog-button dialog-orange' data-dialog-close>
                            @lang('utilities.close')
                        </button>
                    </div>
                </div>
            </div>
            <div id='clan-dialog-radio' class='dialog'>
                <div class='dialog__overlay'></div>
                <div class='dialog__content'>
                    <h2>
                        @lang('about.b1.p5')
                    </h2>
                    <p>
                        @lang('about.b1.p6')
                    </p>
                    <div>
                        <button class='action dialog-button dialog-orange' data-dialog-close>
                            @lang('utilities.close')
                        </button>
                    </div>
                </div>
            </div>
            <div id='clan-dialog-forums' class='dialog'>
                <div class='dialog__overlay'></div>
                <div class='dialog__content'>
                    <h2>
                        @lang('about.b1.p7')
                    </h2>
                    <p>
                        @lang('about.b1.p8')
                    </p>
                    <div>
                        <button class='action dialog-button dialog-orange' data-dialog-close>
                            @lang('utilities.close')
                        </button>
                    </div>
                </div>
            </div>
            <div id='clan-dialog-full-disclosure' class='dialog'>
                <div class='dialog__overlay'></div>
                <div class='dialog__content'>
                    <h2>
                        @lang('about.b1.p9')
                    </h2>
                    <p>
                        @lang('about.b1.p10')
                    </p>
                    <div>
                        <button class='action dialog-button dialog-orange' data-dialog-close>
                            @lang('utilities.close')
                        </button>
                    </div>
                </div>
            </div>
            <div id='clan-dialog-our-members' class='dialog'>
                <div class='dialog__overlay'></div>
                <div class='dialog__content'>
                    <h2>
                        @lang('about.b1.p11')
                    </h2>
                    <p>
                        @lang('about.b1.p12')
                    </p>
                    <div>
                        <button class='action dialog-button dialog-orange' data-dialog-close>
                            @lang('utilities.close')
                        </button>
                    </div>
                </div>
            </div>
            <div id='clan-dialog-community-openness' class='dialog'>
                <div class='dialog__overlay'></div>
                <div class='dialog__content'>
                    <h2>
                        @lang('about.b1.p13')
                    </h2>
                    <p>
                        @lang('about.b1.p14')
                    </p>
                    <div>
                        <button class='action dialog-button dialog-orange' data-dialog-close>
                            @lang('utilities.close')
                        </button>
                    </div>
                </div>
            </div>
            <script>
                about = new About();
            </script>
@stop
